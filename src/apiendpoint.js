// for contact follow up http://localhost:5001/api/con/followup

/* testing data 
{
  "Campaign": "Lead Nurture Campaign",
  "Range": "High Value",
  "ContactNo": "9876543210",
  "Location": "Andheri East",
  "ContactType": "Buyer",
  "Name": "Rahul Sharma",
  "City": "Mumbai",
  "Address": "123 Business Street",
  "ContactIndustry": "Real Estate",
  "ContactFunctionalArea": "Sales",
  "ReferenceId": "REF20251006",
  "Notes": "Interested in premium property options",
  "Facilities": "Gym, Pool",
  "User": "Agent007",
  "date": "2025-10-06",
  "Email": "rahul.sharma@example.com",
  "CompanyName": "Sharma Properties",
  "website": "https://sharmaproperties.in",
  "Status": "Active"
}

 */

// for contact follow up search http://localhost:5001/api/con/follow/search

/* testing data 
{
  "Campaign": "Lead Conversion Campaign",
  "ContactType": "Seller",
  "PropertyType": "Commercial",
  "StatusType": "Follow-up Done",
  "City": "Pune",
  "Location": "Koregaon Park",
  "User": "SalesAgent01",
  "Keyword": "Office Space",
  "Limit": 25
}

 */

//for contact follow up add http://localhost:5001/api/con/follow/add

/* testing data
{
  "StartDate": "2025-10-06",
  "StatusType": "done",
  "FollowupNextDate": "2025-10-10",
  "Description": "Follow up with client regarding property documents."
}
*/ // for contact  http://localhost:5001/api/contact

/* testing data
{
  "Campaign": "Email Marketing Campaign",
  "Range": "Premium",
  "ContactNo": "9876543210",
  "Location": "Gurugram",
  "ContactType": "Buyer",
  "Name": "Ankit Mehta",
  "City": "Delhi NCR",
  "Address": "A-45, Cyber City",
  "ContactIndustry": "IT",
  "ContactFunctionalArea": "Sales",
  "ReferenceId": "REF20251006",
  "Notes": "Interested in B2B collaboration",
  "Facilities": "Conference Room, Parking",
  "date": "2025-10-06",
  "Email": "ankit.mehta@example.com",
  "CompanyName": "Mehta Solutions Pvt Ltd",
  "Website": "https://mehtasolutions.com",
  "Status": "Active",
  "Qualifications": "MBA",
  "AssignTo": "Agent123"
}

 */

// for contact advance search   http://localhost:5001/api/con/adv

/* testing data
{
  "StatusAssign": "Active",
  "Campaign": "Real Estate Outreach",
  "ContactType": "Buyer",
  "city": "Mumbai",
  "Location": "Andheri East",
  "User": "Agent",
  "Keyword": "Luxury Flats",
  "Limit": 50
}

 */

// for company project enquiry http://localhost:5001/api/com/pro/enq

/* testing data
{
  "UserName": "Rohit",
  "ProjrctName": "Commercial Complex",
  "Description": "Inquiry for project collaboration on the new mall development.",
  "date": "2025-10-06"
}

 */

// for customer enquiry  http://localhost:5001/api/cus/enq

/*testing data
{
  "UserName": "Rohit",
  "PropertyName": "Commercial Complex",
  "Description": "Good Space",
  "date": "2025-10-06"
} */

// for masters campaign http://localhost:5001/api/mas/cam

/*
{
  "Name": "Summer Sales Campaign",
  "Status": "Active"
}

 */

// for masters type http://localhost:5001/api/mas/type

/*{
  "Campaign": "Real Estate 2025",
  "Name": "3BHK",
  "Status": "Active"
}
 */

// for masters customer sub type http://localhost:5001/api/mas/sub

/*{
  "Campaign": "Marketing 2025",
  "CustomerType": "Normal",
  "Name": "Lead SubCategory",
  "Status": "Active"
}

 */

// for schedules http://localhost:5001/api/sch

/*
{
  "date": "2025-10-07",
  "Time": "14:30",
  "Description": "Team meeting to discuss project milestones",
  "User": "himanshu jotwani"
}
 */

// for schedules http://localhost:5001/api/task

/*
{
  "date": "2025-10-07",
  "Time": "14:30",
  "Description": "Team meeting to discuss project milestones",
  "User": "himanshu jotwani"
}
 */

// for userlogin  http://localhost:5001/api/user/login
/* 
{
  "email": "himanshu@example.com",
  "password": "Test@123"
}
 */

// for usersignup  http://localhost:5001/api/user/signup
/* 
{
  "fullName": "Himanshu Jotwani",
  "email": "himanshu@example.com",
  "password": "Test@123"
}

 */

// for userupdate  http://localhost:5001/api/user/update

// for checkuser  http://localhost:5001/api/user/check

// for adminlogin  http://localhost:5001/api/admin/login
/* 
{
  "email": "himanshu@example.com",
  "password": "Test@123"
}
 */

// for adminsignup  http://localhost:5001/api/admin/signup
/* 
{
  "email": "himanshu@example.com",
  "password": "Test@123"
}
 */

// for checkadmin  http://localhost:5001/api/admin/check

// getting total followup of a specific customer

//http://localhost:5001/api/cus/followup/customer/68fb2589235887cd91dadc61

// for posting followup of a specific  customer
//http://localhost:5001/api/cus/followup/68fb2589235887cd91dadc61

// for getting followup of a all  customer
// // http://localhost:5001/api/cus/followup

// for customer
//http://localhost:5001/api/customer

// for assigning customers http://localhost:5001/api/customer/assign
/**
 * {
  "customerIds": ["690376c664cfec49371ad0b2"],  
  "assignToId": "6902f0d10d6a8ecb146ecc10" 
}

 */
// for bulk assigning customers by city admin http://localhost:5001/api/customer/assign-all-city
/**
 * {
  "City": "Jaipur",
  "assignToId": "6902f0d10d6a8ecb146ecc10" 
}

 */

// for sending whatsapp message
//http://localhost:5001/api/v1/messages/whatsapp
// {
//      "templateId":"69083aeff944cb9a59c1563f",
//      "customerIds":["690bf6e8cba29966c9fcc595"]
//    }
//for sending email
//http://localhost:5001/api/v1/messages/email
//{
//     "templateId":"6909bef15dea0d6760c18357",
//     "customerIds":["6908c356b0c651c2ca8dc280"]
//   }

//for creating whats app and email template
//http://localhost:5001/api/v1/templates

// for making calls
///http://localhost:5001/api/v1/calls/make

//for getting contact follow up by id http://localhost:5001/api/con/follow/add/contact/68ff8fbd8b434d325b844417

// for posting updating and deleting a follow up for a contact http://localhost:5001/api/con/follow/add/68ff8fbd8b434d325b844417

// for getting all and deleting all contact follow up data http://localhost:5001/api/con/follow/add

// for contact http://localhost:5000/api/contact

// for assigning contacts http://localhost:5001/api/contact/assign
/**
 * {
  "contactId": "690376c664cfec49371ad0b2",
  "assignToId": "6902f0d10d6a8ecb146ecc10" 
}

 */

//for bulk assigning by city admin http://localhost:5001/api/contact/bulk-assign
//{
//  "City": "Jaipur",
//  "assignToId": "6902f0d10d6a8ecb146ecc10"
//}

// for getting fav customers http://localhost:5001/api/favourites

// for adminlogin  http://localhost:5001/api/admin/login

// for adminsignup  http://localhost:5001/api/admin/signup

/**
 * {
  "name": "admin",
  "email": "admin@example.com",
  "password": "Test@123",
  "role": "administrator",
  "city": "Mumbai",  
  "phone": "+911234567890"  
}
 */

// for checkadmin  http://localhost:5001/api/admin/check

// for admin update http://localhost:5001/api/admin/6901ea26ef3c6fa233c93d88/details

// for create a new user , city admin or adminstrator  http://localhost:5001/api/admin/create

/**
 * {
      "AddressLine1": "malviya nagar",
      "AddressLine2": "jaipur",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "city": "Mumbai",
      "phone": "1234567975",
      "status": "active",
      "password": "Test@123"
    }
 */

// for updating password of admins     api/admin/:id/password

// for getting all admin data http://localhost:5001/api/admin/all

// for contact http://localhost:5000/api/contact

// for assign

// for masters campaign http://localhost:5001/api/mas/cam

/*
{
  "Name": "Summer Sales Campaign",
  "Status": "Active"
}

 */
//for masters city http://localhost:5001/api/mas/city
//{
//  "Name": "Summer Sales Campaign",
//  "Status": "Inactive"
//}

//for masters location http://localhost:5001/api/mas/loc
//{
//  "Name": "Summer Sales Campaign",
//  "Status": "Inactive",
// "City": "Mumbai"
//}

//for masters facilities http://localhost:5001/api/mas/fac
//{
//  "Name": "Summer Sales Campaign",
//  "Status": "Inactive",
//}

//for masters amenities http://localhost:5001/api/mas/amen
//{
//
//}
//for masters industries http://localhost:5001/api/mas/ind
//{
//  "Name": "tech ",
//  "Status": "Inactive",
//}

//for masters role http://localhost:5001/api/mas/role
// {
//  "Role": "admin",
//  "Slug": "administrator",
//  "Status": "Inactive",
// }

//for masters contactcampaign http://localhost:5001/api/mas/contactcampaign
// {
//  "Name": "ig ",
//  "Status": "Inactive",
// }

//for masters contacttype http://localhost:5001/api/mas/contacttype
// {

//  "Name": "rohit ",
//  "Status": "Active",
// }

//for masters references http://localhost:5001/api/mas/ref
// {

//  "Name": "pd ",
//  "Status": "Inactive",
// }

//for masters expenses http://localhost:5001/api/mas/exp
// {

//  "Name": "travel ",
//  "Status": "Inactive",
// }

//for masters income http://localhost:5001/api/mas/inc
// {

//  "Name": "yt",
//  "Status": "Inactive",
// }

//for masters statustype http://localhost:5001/api/mas/statustype
// {

//  "Name": "following up",
//  "Status": "Inactive",
// }

// for masters payments http://localhost:5001/api/mas/payments
/*{
  "Name": "Initial Deposit",
  "Status": "Active"
}
 */
// for masters sms http://localhost:5001/api/mas/sms
/*{
  "Name": "pravesh SMS",
  "Status": "Active"
}
 */
// for masters mail http://localhost:5001/api/mas/mail
/*{
  "Name": "pravesh mail",
  "Status": "Active"
}
 */

// for masters whatsapp http://localhost:5001/api/mas/whatsapp
/*{
  "Name": "templat1",
  "Status": "Active"
}
 */
// for masters type http://localhost:5001/api/mas/type

/*{
  "Campaign": "Real Estate 2025",
  "Name": "3BHK",
  "Status": "Active"
}
 */

// for masters customer sub type http://localhost:5001/api/mas/sub

/*{
  "Campaign": "Marketing 2025",
  "CustomerType": "Normal",
  "Name": "Lead SubCategory",
  "Status": "Active"
}

 */

/**
 * for customer data import from the excel file http://localhost:5001/api/customer/import
 *
 * file = excel fle .xlsx .xls .csv
 * Campaign
 * CustomerType
 * CustomerSubType
 */

/**
 * for contact import from excel file http://localhost:5001/api/contact/import
 * file = excel file
 * * Campaign
 * ContactType
 * Range
 */

//for company project http://localhost:5001/api/com/pro

// for builder slider http://localhost:5001/api/mas/buil

// for income marketing http://localhost:5001/api/fin/inc

// for expense marketing http://localhost:5001/api/fin/exp

// posting followup of a contact http://localhost:5001/api/con/follow/add/:contactId

// get update and delete  specific contact follow up http://localhost:5001/api/con/follow/add/:followupId

//getting followup with contact detail http://localhost:5001/api/con/follow/add/contact/:contactId

// chang password http://localhost:5001/api/admin/6909cbc66147b85defc777b1/password
//{"currentPassword":"Test@12", "newPassword":"Himanshu@12"}
//  if city admin or super admin update the password of others then they donont need current password

// getting type by a campaign http://localhost:5001/api/mas/type/campaign/6911c227307566cfb695aa78
//getting sub type by campaign and type http://localhost:5001/api/mas/sub/filter/:campaign/:type
// getting contact type by campaign http://localhost:5001/api/mas/contacttype/campaign/6911c227307566cfb695aa78
