/*==============================================================*/
/* DROP SCHEMA: PUBLIC			                                */
/*==============================================================*/
DROP SCHEMA public;

/*==============================================================*/
/* SCHEMA: DEV			                                        */
/*==============================================================*/
CREATE SCHEMA dev
    AUTHORIZATION postgres;


/*==============================================================*/
/* SCHEMA: CORE			                                        */
/*==============================================================*/
CREATE SCHEMA core
    AUTHORIZATION postgres;

/*==============================================================*/
/* Type: TYPE_NAVIGATION                                        */
/*==============================================================*/
CREATE TYPE core."TYPE_NAVIGATION" AS ENUM
    ('defaultNavigation', 'compactNavigation', 'futuristicNavigation', 'horizontalNavigation');

/*==============================================================*/
/* Type: TYPE_VALIDATION                                        */
/*==============================================================*/
CREATE TYPE core."TYPE_VALIDATION" AS ENUM
    ('validationPassword', 'validationDNI', 'validationPhoneNumber');

/*==============================================================*/
/* Type: TYPE_USER                                              */
/*==============================================================*/
CREATE TYPE core."TYPE_USER" AS ENUM
    ('student', 'teacher');

/*==============================================================*/
/* Type: TYPE_PROFILE                                           */
/*==============================================================*/
CREATE TYPE core."TYPE_PROFILE" AS ENUM
    ('administator', 'commonProfile');



/*==============================================================*/
/* SCHEMA: BUSINESS		                                        */
/*==============================================================*/
CREATE SCHEMA business
    AUTHORIZATION postgres;
