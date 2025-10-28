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

// for sending whatsapp message
//http://localhost:5001/api/v1/messages/whatsapp

//for sending email
//http://localhost:5001/api/v1/messages/email

//for creating whats app and email template
//http://localhost:5001/api/v1/templates

// for making calls
///http://localhost:5001/api/v1/calls/make

//for getting contact follow up by id http://localhost:5001/api/con/follow/add/contact/68ff8fbd8b434d325b844417

// for posting updating and deleting a follow up for a contact http://localhost:5001/api/con/follow/add/68ff8fbd8b434d325b844417

// for getting all and deleting all contact follow up data http://localhost:5001/api/con/follow/add

// for getting fav customers http://localhost:5001/api/favourites
