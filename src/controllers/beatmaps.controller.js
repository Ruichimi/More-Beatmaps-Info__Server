const beatmapsFacade = require('$/facades/beatmaps.facade');
const { AppError } = require('$/errors/AppError');

exports.getBeatmapsDataFromCache = async (req, res, next) => {
    try {
        const beatmapIds = req.query.beatmapsIds ? req.query.beatmapsIds.split(',') : [];

        if (!Array.isArray(beatmapIds) || beatmapIds.length === 0) {
            return res.status(400).json({
                error: 'Missing beatmapsIds query parameter',
                example: '?beatmapsIds=5319044'
            });
        }

        const promises = beatmapIds.map(async (beatmapId) => {
            const data = await beatmapsFacade.getBeatmapData(beatmapId);
            return [beatmapId, data];
        });

        const entries = await Promise.all(promises);
        const result = Object.fromEntries(entries);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getBeatmapData = async (req, res, next) => {
    try {
        const { id: beatmapId } = req.params;
        //The structure of the beatmap
        const { beatmap } = req.body;

        if (!beatmap.includes?.("[General]")) {
            throw new AppError('Invalid beatmap structure', { code: 'INVALID_BEATMAP_STRUCTURE' });
        }
        const calculatedBeatmapData = await beatmapsFacade.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        next(error);
    }
}
