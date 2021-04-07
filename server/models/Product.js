const { Schema, model, Types } = require('mongoose')

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        bids: [
            {
                type: Types.ObjectId,
                ref: 'Bid',
            },
        ],
        productOwner: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        college: {
            type: Types.ObjectId,
            ref: 'College',
        },
    },
    { timestamps: true }
)

module.exports = new model('Product', productSchema)
