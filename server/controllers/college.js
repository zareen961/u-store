const asyncHandler = require('express-async-handler')
const { ObjectID } = require('mongodb')

const State = require('../models/State')
const City = require('../models/City')
const College = require('../models/College')
const Admin = require('../models/Admin')

// to add a new state
const collegeAdd = asyncHandler(async (req, res) => {
    const { state, city, college } = req.body
    let newState = null,
        newCity = null

    // if a new state is passed then create it **************************************
    if (!ObjectID.isValid(state)) {
        newState = await State.create({
            name: state,
            cities: [],
        })

        if (!newState) {
            res.status(500)
            throw new Error('Some error occurred while creating a new State!')
        }
    }

    // if a new city is passed then create it *****************************************
    if (!ObjectID.isValid(city)) {
        newCity = await City.create({
            name: city,
            colleges: [],
        })

        if (!newCity) {
            res.status(500)
            throw new Error('Some error occurred while creating a new City!')
        }

        // finding and updating the state in which the new city is created
        const foundState = await State.findById(newState ? newState._id : state)

        if (!foundState) {
            res.status(500)
            throw new Error('Cannot find the State in which the new City is created!')
        }

        foundState.cities.push(newCity._id)
        foundState.save()
    }

    // Adding a new college ******************************************************
    const newCollege = await College.create({
        name: college,
    })

    if (!newCollege) {
        res.status(500)
        throw new Error('Some Error occurred while adding the college')
    }

    // finding and updating the city in which the new college is created
    const foundCity = await City.findById(newCity ? newCity._id : city)

    if (!foundCity) {
        res.status(500)
        throw new Error('Cannot find the City in which the new College is created!')
    }

    foundCity.colleges.push(newCollege._id)
    foundCity.save()

    res.status(200).send({
        message: 'College Data Added!',
    })
})

// to add a new city
const collegeGetAll = asyncHandler(async (req, res) => {
    const foundStates = await State.find({})
        .sort({ name: 'asc' })
        .populate({
            path: 'cities',
            populate: {
                path: 'colleges',
            },
        })

    if (foundStates) {
        res.status(200).json(foundStates)
    } else {
        res.status(400)
        throw new Error('Some Error occurred while fetching all the college data!')
    }
})

// to add a new college
const collegeDelete = asyncHandler(async (req, res) => {
    const { password, state, city, college } = req.body

    // finding the logged in admin
    const foundAdmin = await Admin.findById(req.authAdmin._id)

    if (foundAdmin && (await foundAdmin.matchPassword(password))) {
        //if college is passed we delete that specific college
        if (state && city && college) {
            const foundCollege = await College.findById(college)

            if (foundCollege) {
                await foundCollege.remove()

                // now removing the collegeID from it's City
                const foundCity = await City.findById(city)
                const collegeIndex = foundCity.colleges.findIndex(
                    (collegeID) => collegeID === college
                )
                foundCity.colleges.splice(collegeIndex, 1)
                await foundCity.save()

                return res.status(200).json({
                    message: 'College Deleted!',
                })
            } else {
                res.status(404)
                throw new Error('No college found!')
            }
        }

        //if city is passed we delete that specific city and all it's colleges
        if (state && city) {
            const foundCity = await City.findById(city)

            if (foundCity) {
                // deleting all the colleges of that city
                await College.deleteMany({ _id: { $in: foundCity.colleges } })

                await foundCity.remove()

                // now removing the cityID from it's State
                const foundState = await State.findById(state)
                const cityIndex = foundState.cities.findIndex((cityID) => cityID === city)
                foundState.cities.splice(cityIndex, 1)
                await foundState.save()

                return res.status(200).json({
                    message: 'City Deleted!',
                })
            } else {
                res.status(404)
                throw new Error('No city found!')
            }
        }

        //if only state is passed we delete that specific state and all it's cities and colleges
        if (state) {
            const foundState = await State.findById(state).populate('cities')

            if (foundState) {
                // building the arrays of IDs to be deleted together
                const cityIDsToDelete = [],
                    collegeIDsToDelete = []
                foundState.cities.forEach((city) => {
                    cityIDsToDelete.push(city._id)
                    collegeIDsToDelete.push(...city.colleges)
                })

                // deleting all the colleges of the state
                await College.deleteMany({ _id: { $in: collegeIDsToDelete } })

                // deleting all the cities of that state
                await City.deleteMany({ _id: { $in: cityIDsToDelete } })

                await foundState.remove()
                return res.status(200).json({
                    message: 'State Deleted!',
                })
            } else {
                res.status(404)
                throw new Error('No state found!')
            }
        }

        res.status(401)
        throw new Error('No data provided')
    } else {
        res.status(401)
        throw new Error('Wrong Credentials!')
    }
})

module.exports = { collegeAdd, collegeGetAll, collegeDelete }