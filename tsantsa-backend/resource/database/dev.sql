select * from business.view_user
select * from dev.utils_get_columns_type('core', 'person')
select * from dev.ddl_create_crud_modified('business', 'user_task')


id_newsletter numeric, id_company numeric, id_user numeric, name_newsletter character varying, description_newsletter character varying, date_newsletter timestamp with time zone, deleted_newsletter boolean, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying




cvn.id_newsletter, cvn.id_company, cvn.id_user, cvn.name_newsletter, cvn.description_newsletter, cvn.date_newsletter, cvn.deleted_newsletter, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person 


select cvn.id_newsletter, cvn.id_company, cvn.id_user, cvn.name_newsletter, cvn.description_newsletter, cvn.date_newsletter, cvn.deleted_newsletter, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person  from core.view_newsletter cvn
inner join core.view_user cvu on cvn.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person

