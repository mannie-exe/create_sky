package design.inherent.atlas;

import com.google.gson.*;
import net.minecraft.core.registries.Registries;
import net.minecraft.nbt.*;
import net.minecraft.resources.*;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.*;
import org.sathrek.sky_archipelago.config.*;
import org.sathrek.sky_archipelago.config.settings.*;
import org.sathrek.sky_archipelago.worldgen.generator.field.IslandField;
import java.nio.file.*;
import java.util.*;

/** Opt-in, read-only seed/settings probe. It generates no chunks and loads no player data. */
final class WorldgenProbe {
  private static final Gson GSON = new GsonBuilder().disableHtmlEscaping().create();
  static void export(MinecraftServer server, Path out) throws Exception {
    String input = System.getProperty("atlas.worldgen.level");
    if (input == null) return;
    byte[] before = Files.readAllBytes(Path.of(input));
    var data = NbtIo.readCompressed(new java.io.ByteArrayInputStream(before), NbtAccounter.unlimitedHeap()).getCompound("Data");
    var worldgen = data.getCompound("WorldGenSettings");
    long seed = worldgen.getLong("seed");
    var encoded = worldgen.getCompound("dimensions").getCompound("minecraft:overworld").getCompound("generator");
    var generator = (org.sathrek.sky_archipelago.worldgen.generator.core.SkyIslandChunkGenerator)
      ChunkGenerator.CODEC.parse(RegistryOps.create(NbtOps.INSTANCE, server.registryAccess()), encoded).getOrThrow();
    var settings = generator.resolvedSkyIslandSettings();
    var random = RandomState.create(server.registryAccess().registryOrThrow(Registries.NOISE_SETTINGS).getOrThrow(NoiseGeneratorSettings.OVERWORLD), server.registryAccess().registryOrThrow(Registries.NOISE).asLookup(), seed);
    var getField = generator.getClass().getDeclaredMethod("getIslandField", RandomState.class);
    getField.setAccessible(true);
    IslandField field = (IslandField)getField.invoke(generator, random);
    var spacingMethod = IslandField.class.getDeclaredMethod("effectiveClusterSpacing", SkyIslandSettings.class);
    spacingMethod.setAccessible(true);
    int spacing = (int)spacingMethod.invoke(field, settings);
    var dynamic = withSpacing(settings, new ClusterSpacingSettings(ClusterSpacingMode.DYNAMIC, 96, 32, 1500));
    int seedSpacing = (int)spacingMethod.invoke(field, dynamic);
    var fixed = withSpacing(settings, new ClusterSpacingSettings(ClusterSpacingMode.CONSISTENT, seedSpacing, seedSpacing, seedSpacing));
    JsonObject result = new JsonObject();
    result.addProperty("source", "Read-only level.dat generator/seed; current authored/common overrides in isolated server");
    result.addProperty("levelSha256", digest(before));
    result.addProperty("seedSha256", digest(Long.toString(seed).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    result.addProperty("stockEmbeddedSettings", generator.embeddedSettings().map(SkyIslandConfig::isStockEmbeddedSettings).orElse(false));
    result.addProperty("effectiveSpacing", spacing);
    result.addProperty("originalDynamicSpacing", seedSpacing);
    result.add("resolvedTerrain", GSON.toJsonTree(settings.terrain()));
    result.addProperty("overlapMode", settings.advanced().terrainOverlapMode().toString());
    JsonArray samples = new JsonArray();
    for (long otherSeed = 0; otherSeed < 64; otherSeed++) {
      var rs = RandomState.create(server.registryAccess().registryOrThrow(Registries.NOISE_SETTINGS).getOrThrow(NoiseGeneratorSettings.OVERWORLD), server.registryAccess().registryOrThrow(Registries.NOISE).asLookup(), otherSeed);
      long layoutSeed = rs.getOrCreateRandomFactory(ResourceLocation.fromNamespaceAndPath("sky_archipelago", "sky_island_layout")).at(0,0,0).nextLong();
      var candidate = new IslandField(layoutSeed);
      JsonObject row = new JsonObject(); row.addProperty("seed",otherSeed);
      row.addProperty("dynamic",(int)spacingMethod.invoke(candidate,dynamic));
      row.addProperty("consistent",(int)spacingMethod.invoke(candidate,fixed));samples.add(row);
    }
    result.add("seedSamples", samples);
    // Descriptor previews use the real biome sampler. They are not generated structures or surface paths.
    int radius = 2048;
    var a = field.collectIslandPreviewsInRadius(0,0,radius,dynamic);
    var b = field.collectIslandPreviewsInRadius(0,0,radius,fixed);
    result.addProperty("previewRadius",radius); result.addProperty("previews",a.size());
    result.addProperty("fixedMatchesDynamicPreviews",a.equals(b));
    if (!a.equals(b)) throw new IllegalStateException("Fixed spacing changed island descriptors for the current seed");
    result.add("islandPreviews", GSON.toJsonTree(a));
    int compared=0;
    for(int x=-512;x<=512;x+=128)for(int z=-512;z<=512;z+=128) {
      var da=field.sampleColumnProfile(x,z,dynamic);var db=field.sampleColumnProfile(x,z,fixed);
      if (!Objects.equals(da,db)) throw new IllegalStateException("Fixed spacing changed terrain column " + x + "," + z);
      compared++;
    }
    result.addProperty("equalColumnProfiles",compared);
    result.addProperty("levelUnchangedDuringRead",Arrays.equals(before,Files.readAllBytes(Path.of(input))));
    Files.writeString(out.resolve("worldgen_review.json"),GSON.toJson(result));
  }
  private static SkyIslandSettings withSpacing(SkyIslandSettings settings, ClusterSpacingSettings spacing) throws Exception {
    var terrain=(TerrainSettings)replace(settings.terrain(),"spacing",spacing);
    return (SkyIslandSettings)replace(settings,"terrain",terrain);
  }
  private static Object replace(Record value,String name,Object replacement) throws Exception {
    var parts=value.getClass().getRecordComponents();Class<?>[] types=new Class<?>[parts.length];Object[] args=new Object[parts.length];
    for(int i=0;i<parts.length;i++){types[i]=parts[i].getType();args[i]=parts[i].getName().equals(name)?replacement:parts[i].getAccessor().invoke(value);}
    return value.getClass().getDeclaredConstructor(types).newInstance(args);
  }
  private static String digest(byte[] bytes) throws Exception {
    return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes));
  }
}
