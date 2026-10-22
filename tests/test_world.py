import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import numpy as np
from world import chunk_locations, palette_indices, chunk_metrics

class WorldTests(unittest.TestCase):
    def test_empty_pregen_placeholder_is_not_1024_chunks(self):
        self.assertEqual(chunk_locations(b''),[])
        self.assertEqual(chunk_locations(bytes(4096)),[])
        header=bytearray(4096);header[0:4]=bytes([0,0,2,1])
        self.assertEqual(chunk_locations(header),[(0,2)])
    def test_truncated_header_is_rejected(self):
        with self.assertRaises(ValueError):chunk_locations(b'\0'*10)
    def test_palette_padded_longs(self):
        values=np.array([i%17 for i in range(4096)],dtype=np.uint64)
        words=np.zeros(342,dtype=np.uint64)
        for i,v in enumerate(values):words[i//12]|=v<<np.uint64((i%12)*5)
        result=palette_indices({'palette':[{}]*17,'data':words})
        np.testing.assert_array_equal(result,values)
    def test_ore_y_and_land_columns(self):
        result=chunk_metrics({'sections':[{'Y':-2,'block_states':{'palette':[{'Name':'minecraft:iron_ore'}]}}]})
        self.assertEqual(result['ores']['minecraft:iron_ore'],4096)
        self.assertEqual(result['levels']['minecraft:iron_ore']['-32'],256)
        self.assertEqual(result['landColumns'],256)

if __name__=='__main__':unittest.main()
