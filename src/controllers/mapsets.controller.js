const mapsetsFacade = require('$/facades/mapsets.facade');
const { AppError } = require('$/errors/AppError');

exports.getMapsetsData = async (req, res, next) => {
    try {

        const mapsetIds = req.query.mapsetsIds?.split(',') || [];

        if (!Array.isArray(mapsetIds) || mapsetIds.length === 0) {
            return res.status(400).send('Expected an array of items');
        }

        const data = await Promise.all(
            mapsetIds.map(id => mapsetsFacade.getMapsetData(id))
        );

        const result = Object.fromEntries(
            mapsetIds.map((id, index) => [id, data[index]])
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateMapset = async (req, res, next) => {

    try {
        //throw new AppError('2321', {code: 'FAILED_UPDATE_MAPSET'});
        const mapsetId = req.params.id;
        if (!mapsetId) {
            throw new AppError('Invalid mapset id', { code: 'INVALID_MAPSET_ID_CLIENT' });
        }

        const updatedMapset = await mapsetsFacade.updateMapset(mapsetId);

        res.status(200).json(updatedMapset);
    } catch (error) {
        next(error);
    }
}
