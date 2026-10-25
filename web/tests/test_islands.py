import unittest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from islands import resource_survey


class IslandSurveyTests(unittest.TestCase):
    def sample(self):
        return {'kind': 'create-sky-island-survey', 'schema': 1, 'complete': True,
                'artifacts': {'mod.jar': 'abc'},
                'islands': [{'observedBlocks': {'create:zinc_ore': 4}, 'estimatedBlocks': {'create:zinc_ore': 80}}]}

    def test_preserves_observed_and_estimated_counts_separately(self):
        result = resource_survey(self.sample(), 'source-hash')
        self.assertEqual(result['sourceSha256'], 'source-hash')
        self.assertEqual(result['islands'][0]['observedBlocks']['create:zinc_ore'], 4)
        self.assertEqual(result['islands'][0]['estimatedBlocks']['create:zinc_ore'], 80)

    def test_failed_unstamped_and_invalid_counts_are_rejected(self):
        for key, value in [('complete', False), ('artifacts', {}), ('schema', 2)]:
            sample = self.sample(); sample[key] = value
            with self.assertRaises(ValueError): resource_survey(sample, 'hash')
        for value in [-1, float('inf'), float('nan')]:
            sample = self.sample(); sample['islands'][0]['estimatedBlocks']['create:zinc_ore'] = value
            with self.assertRaises(ValueError): resource_survey(sample, 'hash')


if __name__ == '__main__': unittest.main()
