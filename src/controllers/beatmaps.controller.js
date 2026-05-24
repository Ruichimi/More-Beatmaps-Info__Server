const beatmapsFacade = require('$/facades/beatmaps.facade');
const axios = require('$/infrastructure/axios');
const { AppError } = require('$/errors/AppError');

const isValidBeatmapId = (beatmapId) => /^\d+$/.test(String(beatmapId));

const fetchBeatmapStructureAsText = async (beatmapId) => {
    try {
        const response = await axios.get(`https://osu.ppy.sh/osu/${beatmapId}`, {
            responseType: 'text',
        });

        const beatmapStructure = response.data;

        if (beatmapStructure.length < 50 || typeof beatmapStructure !== 'string') {
            throw new AppError('Invalid beatmap structure', { code: 'INVALID_BEATMAP_STRUCTURE' });
        }

        return beatmapStructure;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to fetch beatmap structure', {
            code: 'OSU_API_ERROR',
            cause: error,
        });
    }
};

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

exports.getBeatmapDataById = async (req, res, next) => {
    try {
        const { id: beatmapId } = req.params;

        if (!isValidBeatmapId(beatmapId)) {
            throw AppError.validationError({ id: 'Beatmap ID must contain only digits' });
        }

        const beatmapStructure = await fetchBeatmapStructureAsText(beatmapId);

        if (!beatmapStructure.includes?.("[General]")) {
            throw new AppError('Invalid beatmap structure', { code: 'INVALID_BEATMAP_STRUCTURE' });
        }

        const calculatedBeatmapData = beatmapsFacade.getRawBeatmapData(beatmapId, beatmapStructure);
        res.json(calculatedBeatmapData);
    } catch (error) {
        next(error);
    }
}
