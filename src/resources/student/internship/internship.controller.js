var ObjectId = require('mongoose').Types.ObjectId;
const InternshipProposal = require('../../../models/internshipproposal');
const InternshipApplication = require('../../../models/internshipapplication');

const userData = require("./../../../users");

const getProposalsListForStudent = function (req, res) { 
    //console.log("ObjectId(userData.user._id): ", ObjectId(userData.user._id));
    InternshipProposal.aggregate([
        {
            $lookup:
            {
                from: 'companies',
                localField: 'companyId',
                foreignField: '_id',
                as: 'company'
            }
        },
        { $unwind: '$company' }, {
            
            $lookup:
            {
                from: 'internshipapplications',
                localField: '_id',
                foreignField: 'proposalId',
                as: 'internship'
            }
        },
        {
            "$addFields": {
                "internship": {
                    "$arrayElemAt": [
                        {
                            "$filter": {
                                "input": "$internship",
                                "as": "internship",
                                "cond": {
                                    "$eq": ["$$internship.studentId", ObjectId(userData.user._id)]
                                }
                            }
                        }, 0
                    ]
                }
            }
        },{
            $project:
            {
                _id: 1,
                profile: 1,
                sector: 1,
                description: 1,
                location: 1,
                stipend: 1,
                periodFrom: 1,
                periodTo: 1,
                minTenth: 1,
                minTwelfth: 1,
                minDiploma: 1,
                minDegreeCGPA: 1,
                deadlineDate: 1,
                companyId: 1,
                companyName: "$company.name",
                companyLogo: "$company.logo",
                internshipId: "$internship._id",
                status: "$internship.status",
                hasAccepted: "$internship.hasAccepted",
                appliedOn: "$internship.appliedOn",
                resumeSubmitted: "$internship.resumeSubmitted"
            }

        }])
        .exec()
        .then(docs => res.status(200)
            .json(docs))
        .catch(err => res.status(500)
            .json({
                message: 'Error finding proposals',
                error: err
    }))
}

const applyForInternship = function (req, res) {
        
    let data = {...req.body};
    data.studentId = ObjectId(userData.user._id);
    let internshipApplication = new InternshipApplication(data)
    internshipApplication.save(function (err, project) {

        if (err) {				
            return res.status(400).json(err)
        }
        let internshipData =  {};//project);
        internshipData.internshipId =  project._id;
        internshipData.status = project.status;
        internshipData.hasAccepted = project.hasAccepted;
        internshipData.appliedOn = project.appliedOn;
        internshipData.resumeSubmitted = project.resumeSubmitted;
        internshipData.proposalId = project.proposalId;
        res.status(200).json(internshipData)
    })
    
}

const acceptOffer = function (req, res) {
        
    //let internshipStatusItems = req.body;
    
    let results = [];
    InternshipApplication.updateOne({_id:internshipStatusItem._id}, { $set: req.body}, 
        function (err, project) {
            
            if (err) {				
                return res.status(400).json(err)
            }
            //results.push(internshipStatusItem);
            //res.status(200).json(results)
            //if(results.length == internshipStatusItems.length){
                res.status(200).json(req.body);
            //}
        })
    
}




module.exports = {
    getProposalsListForStudent,
    applyForInternship,
    acceptOffer
}
