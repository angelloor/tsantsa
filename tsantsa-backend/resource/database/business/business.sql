select dev.ddl_config('business');

update dev.ddl_config dc set haved_handler_attribute = 'name_period' where dc.table_name = 'period';
update dev.ddl_config dc set haved_handler_attribute = 'name_career' where dc.table_name = 'career';
update dev.ddl_config dc set haved_handler_attribute = 'name_course' where dc.table_name = 'course';
update dev.ddl_config dc set haved_handler_attribute = 'name_task' where dc.table_name = 'task';

select dev.ddl_create_sequences('business');
select dev.ddl_create_view('business');
select dev.ddl_createall_crud('business');

select dev.dml_reset_sequences('business');
select dev.dml_truncateall('business');