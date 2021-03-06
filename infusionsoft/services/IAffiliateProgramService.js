module.exports = IAffiliateProgramService = require('typedef')

// THIS CODE WAS GENERATED BY AN AUTOMATED TOOL. Editing it is not recommended.
// For more information, see http://github.com/bvalosek/grunt-infusionsoft
// Generated on Wed Jan 08 2014 12:43:55 GMT-0600 (CST)

// The Affiliate Program Service allows access to some of features in the Referral
// Partner Center
.interface('IAffiliateProgramService') .define({

    // Gets a list of all of the affiliates with their contact data for the
    // specified program. This includes all of the custom fields defined for the
    // contact and affiliate records that are retrieved.
    __xmlrpc__getAffiliatesByProgram: function(programId) {},

    // Gets a list of all of the Affiliate Programs for the Affiliate specified.
    __xmlrpc__getProgramsForAffiliate: function(affiliateId) {},

    // Gets a list of all of the Affiliate Programs that are in the application.
    __xmlrpc__getAffiliatePrograms: function(apiKey) {},

    // Gets a list of all of the resources that are associated to the Affiliate
    // Program specified.
    __xmlrpc__getResourcesForAffiliateProgram: function(programId) {}

});