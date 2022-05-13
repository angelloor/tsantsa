-- FUNCTION: business.dml_period_create_modified(numeric)
-- DROP FUNCTION IF EXISTS business.dml_period_create_modified(numeric);

CREATE OR REPLACE FUNCTION business.dml_period_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_period numeric, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, deleted_period boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_PERIOD NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
			
				_ID_PERIOD = (select * from business.dml_period_create(id_user_, _ID_COMPANY, 'Nuevo periodo', '', now()::timestamp, now()::timestamp, 10, 7, false));
				
				IF (_ID_PERIOD >= 1) THEN
					RETURN QUERY select bvp.id_period, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvp.deleted_period, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company from business.view_period bvp
						inner join core.view_company cvc on bvp.id_company = cvc.id_company
						where bvp.id_period = _ID_PERIOD;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el periodo';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_period_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_period_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean)
-- DROP FUNCTION IF EXISTS business.dml_period_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean);

CREATE OR REPLACE FUNCTION business.dml_period_update_modified(
	id_user_ numeric,
	_id_period numeric,
	_id_company numeric,
	_name_period character varying,
	_description_period character varying,
	_start_date_period timestamp without time zone,
	_end_date_period timestamp without time zone,
	_maximum_rating numeric,
	_approval_note_period numeric,
	_deleted_period boolean)
    RETURNS TABLE(id_period numeric, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, deleted_period boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_PERIOD BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_PERIOD = (select business.dml_period_update(id_user_, _id_period, _id_company, _name_period, _description_period, _start_date_period, _end_date_period, _maximum_rating, _approval_note_period, _deleted_period));

			 	IF (_UPDATE_PERIOD) THEN
					RETURN QUERY select bvp.id_period, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvp.deleted_period, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company from business.view_period bvp
						inner join core.view_company cvc on bvp.id_company = cvc.id_company
						where bvp.id_period = _id_period;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el periodo';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_period_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_career_create_modified(numeric)
-- DROP FUNCTION IF EXISTS business.dml_career_create_modified(numeric);

CREATE OR REPLACE FUNCTION business.dml_career_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_career numeric, id_company numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, deleted_career boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_CAREER NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
			
				_ID_CAREER = (select * from business.dml_career_create(id_user_, _ID_COMPANY, 'Nuevo curso', '', false, now()::timestamp, false));

				IF (_ID_CAREER >= 1) THEN
					RETURN QUERY select bvc.id_career, bvc.id_company, bvc.name_career, bvc.description_career, bvc.status_career, bvc.creation_date_career, bvc.deleted_career, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company from business.view_career bvc
						inner join core.view_company cvc on bvc.id_company = cvc.id_company
						where bvc.id_career = _ID_CAREER;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el curso';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_career_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_career_update_modified(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_career_update_modified(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_career_update_modified(
	id_user_ numeric,
	_id_career numeric,
	_id_company numeric,
	_name_career character varying,
	_description_career character varying,
	_status_career boolean,
	_creation_date_career timestamp without time zone,
	_deleted_career boolean)
    RETURNS TABLE(id_career numeric, id_company numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, deleted_career boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_CAREER BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_CAREER = (select * from business.dml_career_update(id_user_, _id_career, _id_company, _name_career, _description_career, _status_career, _creation_date_career, _deleted_career));

			 	IF (_UPDATE_CAREER) THEN
					RETURN QUERY select bvc.id_career, bvc.id_company, bvc.name_career, bvc.description_career, bvc.status_career, bvc.creation_date_career, bvc.deleted_career, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company from business.view_career bvc
						inner join core.view_company cvc on bvc.id_company = cvc.id_company
						where bvc.id_career = _id_career;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el curso';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_career_update_modified(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_course_create_modified(numeric)
-- DROP FUNCTION IF EXISTS business.dml_course_create_modified(numeric);

CREATE OR REPLACE FUNCTION business.dml_course_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_course numeric, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, deleted_course boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_PERIOD NUMERIC;
				_ID_CAREER NUMERIC;
				_ID_SCHEDULE NUMERIC;
				_ID_COURSE NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
			
				_ID_PERIOD = (select bvp.id_period from business.view_period bvp order by bvp.id_period desc limit 1);
				
				IF (_ID_PERIOD IS NULL) THEN
					_EXCEPTION = 'No se encontraron periodos registrados';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				
				_ID_CAREER = (select bvc.id_career from business.view_career bvc where bvc.status_career = true order by bvc.id_career desc limit 1);
				
				IF (_ID_CAREER IS NULL) THEN
					_EXCEPTION = 'No se encontraron cursos activos';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;

				_ID_SCHEDULE = (select * from business.dml_schedule_create(id_user_, now()::time, now()::time, 60, now()::timestamp, false));
				
				IF (_ID_SCHEDULE IS NULL) THEN
					_EXCEPTION = 'Ocurrió un error ingresando el horario de la asignatura';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;

				_ID_COURSE = (select * from business.dml_course_create(id_user_, _ID_COMPANY, _ID_PERIOD, _ID_CAREER, _ID_SCHEDULE, 'Nueva asignatura', '', false, now()::timestamp, false));

				IF (_ID_COURSE >= 1) THEN
					RETURN QUERY select bvc.id_course, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvc.deleted_course, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_course bvc
						inner join core.view_company cvc on bvc.id_company = cvc.id_company
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs  on bvc.id_schedule = bvs.id_schedule
						where bvc.id_course = _ID_COURSE; 
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la asignatura';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_course_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_course_update_modified(numeric, numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean, time without time zone, time without time zone, numeric, timestamp without time zone)
-- DROP FUNCTION IF EXISTS business.dml_course_update_modified(numeric, numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean, time without time zone, time without time zone, numeric, timestamp without time zone);

CREATE OR REPLACE FUNCTION business.dml_course_update_modified(
	id_user_ numeric,
	_id_course numeric,
	_id_company numeric,
	_id_period numeric,
	_id_career numeric,
	_id_schedule numeric,
	_name_course character varying,
	_description_course character varying,
	_status_course boolean,
	_creation_date_course timestamp without time zone,
	_deleted_course boolean,
	_start_date_schedule time without time zone,
	_end_date_schedule time without time zone,
	_tolerance_schedule numeric,
	_creation_date_schedule timestamp without time zone)
    RETURNS TABLE(id_course numeric, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, deleted_course boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_SCHEDULE BOOLEAN;
			 	_UPDATE_COURSE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_SCHEDULE = (select * from business.dml_schedule_update(id_user_, _id_schedule, _start_date_schedule, _end_date_schedule, _tolerance_schedule, _creation_date_schedule, false));
			 
			 	IF (_UPDATE_SCHEDULE) THEN
					_UPDATE_COURSE = (select * from business.dml_course_update(id_user_, _id_course, _id_company, _id_period, _id_career, _id_schedule, _name_course, _description_course, _status_course, _creation_date_course, _deleted_course));

					IF (_UPDATE_COURSE) THEN
						RETURN QUERY select bvc.id_course, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvc.deleted_course, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_course bvc
							inner join core.view_company cvc on bvc.id_company = cvc.id_company
							inner join business.view_period bvp on bvc.id_period = bvp.id_period
							inner join business.view_career bvca on bvc.id_career = bvca.id_career
							inner join business.view_schedule bvs  on bvc.id_schedule = bvs.id_schedule
							where bvc.id_course = _id_course; 
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar la asignatura';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el horario de la asignatura';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_course_update_modified(numeric, numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean, time without time zone, time without time zone, numeric, timestamp without time zone)
    OWNER TO postgres;

-- FUNCTION: business.dml_course_delete_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_course_delete_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_course_delete_modified(
	id_user_ numeric,
	_id_course numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
			 DECLARE
			 	_ID_SCHEDULE NUMERIC;
			 	_DELETE_SCHEDULE BOOLEAN;
			 	_DELETE_COURSE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_ID_SCHEDULE = (select bvc.id_schedule from business.view_course bvc where bvc.id_course =_id_course);
				
				_DELETE_COURSE = (select * from business.dml_course_delete(id_user_, _id_course));
				
				IF (_DELETE_COURSE) THEN
					_DELETE_SCHEDULE = (select * from business.dml_schedule_delete(id_user_, _ID_SCHEDULE));
					
					IF (_DELETE_SCHEDULE) THEN
						RETURN true;
					ELSE
						_EXCEPTION = 'Ocurrió un error al eliminar el horario de la asignatura';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al eliminar la asignatura';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_course_delete_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_enrollment_create_modified(numeric, numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_enrollment_create_modified(numeric, numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_enrollment_create_modified(
	id_user_ numeric,
	_id_course numeric,
	_id_user numeric)
    RETURNS TABLE(id_enrollment numeric, id_course numeric, id_user numeric, date_enrollment timestamp without time zone, status_enrollment boolean, completed_course boolean, deleted_enrollment boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_ENROLLMENT NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_ENROLLMENT = (select * from business.dml_enrollment_create(id_user_, _id_course, _id_user, now()::timestamp, false, false, false));

				IF (_ID_ENROLLMENT >= 1) THEN
					RETURN QUERY select bve.id_enrollment, bve.id_course, bve.id_user, bve.date_enrollment, bve.status_enrollment, bve.completed_course, bve.deleted_enrollment, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_enrollment bve
						inner join business.view_course bvc on bve.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						inner join core.view_user cvu on bve.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bve.id_enrollment = _ID_ENROLLMENT;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la matrícula';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_enrollment_create_modified(numeric, numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_enrollment_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean)
-- DROP FUNCTION IF EXISTS business.dml_enrollment_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION business.dml_enrollment_update_modified(
	id_user_ numeric,
	_id_enrollment numeric,
	_id_course numeric,
	_id_user numeric,
	_date_enrollment timestamp without time zone,
	_status_enrollment boolean,
	_completed_course boolean,
	_deleted_enrollment boolean)
    RETURNS TABLE(id_enrollment numeric, id_course numeric, id_user numeric, date_enrollment timestamp without time zone, status_enrollment boolean, completed_course boolean, deleted_enrollment boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_ENROLLMENT BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_ENROLLMENT = (select * from business.dml_enrollment_update(id_user_, _id_enrollment, _id_course, _id_user, _date_enrollment, _status_enrollment, _completed_course, _deleted_enrollment));

			 	IF (_UPDATE_ENROLLMENT) THEN
				RETURN QUERY select bve.id_enrollment, bve.id_course, bve.id_user, bve.date_enrollment, bve.status_enrollment, bve.completed_course, bve.deleted_enrollment, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_enrollment bve
						inner join business.view_course bvc on bve.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						inner join core.view_user cvu on bve.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bve.id_enrollment = _id_enrollment;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la matrícula';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_enrollment_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_task_create_modified(numeric, numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_task_create_modified(numeric, numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_task_create_modified(
	id_user_ numeric,
	_id_course numeric,
	_id_partial numeric)
    RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, id_partial numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_TASK NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN				
				_ID_TASK = (select * from business.dml_task_create(id_user_, _id_course, id_user_, _id_partial, 'Nueva tarea', '', false, now()::timestamp, (select * from core.utils_get_date_maximum_hour()), false));

				IF (_ID_TASK >= 1) THEN
					RETURN QUERY select bvt.id_task, bvt.id_course, bvt.id_user, bvt.id_partial, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_task bvt
						inner join business.view_course bvc on bvt.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						where bvt.id_task = _ID_TASK;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la tarea';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_task_create_modified(numeric, numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_task_update_modified(numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_task_update_modified(numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_task_update_modified(
	id_user_ numeric,
	_id_task numeric,
	_id_course numeric,
	_id_user numeric,
	_id_partial numeric,
	_name_task character varying,
	_description_task character varying,
	_status_task boolean,
	_creation_date_task timestamp without time zone,
	_limit_date timestamp without time zone,
	_deleted_task boolean)
    RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, id_partial numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_TASK BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_TASK = (select * from business.dml_task_update(id_user_, _id_task, _id_course, _id_user, _id_partial, _name_task, _description_task, _status_task, _creation_date_task, _limit_date, _deleted_task));

			 	IF (_UPDATE_TASK) THEN
					RETURN QUERY select bvt.id_task, bvt.id_course, bvt.id_user, bvt.id_partial, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_task bvt
						inner join business.view_course bvc on bvt.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						where bvt.id_task = _id_task;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la tarea';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_task_update_modified(numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_task_send(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_task_send(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_task_send(
	id_user_ numeric,
	_id_task numeric,
	_id_course numeric,
	_id_user numeric,
	_name_task character varying,
	_description_task character varying,
	_status_task boolean,
	_creation_date_task timestamp without time zone,
	_limit_date timestamp without time zone,
	_deleted_task boolean)
    RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_X RECORD;
				_COUNT_USER_TASK NUMERIC;
				_ID_USER_TASK NUMERIC;
				_SEND_TASK BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- obtener los estudiantes matriculados en el curso segun la tarea
				FOR _X IN select bve.id_user from business.view_enrollment bve
				inner join business.view_course bvc on bve.id_course = bvc.id_course
				inner join business.view_task bvt on bvc.id_course = bvt.id_course
				where bve.status_enrollment = true and bve.completed_course = false and bvt.id_task = _id_task LOOP
					_COUNT_USER_TASK = (select count(*) from business.view_user_task bvut where bvut.id_user = _X.id_user and bvut.id_task = _id_task);
				
					IF (_COUNT_USER_TASK = 0) THEN
						_ID_USER_TASK = (select * from business.dml_user_task_create(id_user_, _X.id_user, _id_task, '', null, null, false, false, false));
					END IF;
				END LOOP;
				
				_SEND_TASK = (select * from business.dml_task_update(id_user_, _id_task, _id_course, _id_user, _name_task, _description_task, _status_task, _creation_date_task, _limit_date, _deleted_task));
	
				IF (_SEND_TASK) THEN
					RETURN QUERY select bvt.id_task, bvt.id_course, bvt.id_user, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_task bvt
						inner join business.view_course bvc on bvt.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						inner join business.view_career bvca on bvc.id_career = bvca.id_career
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						where bvt.id_task = _id_task; 
				ELSE
					_EXCEPTION = 'Ocurrió un error al enviar la tarea';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_task_send(numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_resource_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_resource_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_resource_create_modified(
	id_user_ numeric,
	_id_task numeric)
    RETURNS TABLE(id_resource numeric, id_task numeric, name_resource character varying, description_resource character varying, link_resource character varying, deleted_resource boolean, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_RESOURCE NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_RESOURCE = (select * from business.dml_resource_create(id_user_, _id_task, 'Nuevo recurso', '', '', false));

				IF (_ID_RESOURCE >= 1) THEN
					RETURN QUERY select bvr.id_resource, bvr.id_task, bvr.name_resource, bvr.description_resource, bvr.link_resource, bvr.deleted_resource, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date from business.view_resource bvr
						inner join business.view_task bvt on bvr.id_task = bvt.id_task
						where bvr.id_resource = _ID_RESOURCE;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el recurso';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_resource_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_resource_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean)
-- DROP FUNCTION IF EXISTS business.dml_resource_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean);

CREATE OR REPLACE FUNCTION business.dml_resource_update_modified(
	id_user_ numeric,
	_id_resource numeric,
	_id_task numeric,
	_name_resource character varying,
	_description_resource character varying,
	_link_resource character varying,
	_deleted_resource boolean)
    RETURNS TABLE(id_resource numeric, id_task numeric, name_resource character varying, description_resource character varying, link_resource character varying, deleted_resource boolean, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_RESOURCE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_RESOURCE = (select * from business.dml_resource_update(id_user_, _id_resource, _id_task, _name_resource, _description_resource, _link_resource, _deleted_resource));

			 	IF (_UPDATE_RESOURCE) THEN
					RETURN QUERY select bvr.id_resource, bvr.id_task, bvr.name_resource, bvr.description_resource, bvr.link_resource, bvr.deleted_resource, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date from business.view_resource bvr
						inner join business.view_task bvt on bvr.id_task = bvt.id_task
						where bvr.id_resource = _id_resource;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el recurso';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_resource_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_user_task_create_modified(numeric, numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_user_task_create_modified(numeric, numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_user_task_create_modified(
	id_user_ numeric,
	_id_user numeric,
	_id_task numeric)
    RETURNS TABLE(id_user_task numeric, bvut_id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, cvt_id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, maximum_rating numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_USER_TASK NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_USER_TASK = (select * from business.dml_user_task_create(id_user_, _id_user, _id_task, '', null, null, false, false, false));

				IF (_ID_USER_TASK >= 1) THEN
					RETURN QUERY select bvut.id_user_task, bvut.id_user as bvut_id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.id_user as cvt_id_user, cvt.name_task, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.maximum_rating from business.view_user_task bvut
						inner join core.view_user cvu on bvut.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						inner join business.view_task cvt  on bvut.id_task = cvt.id_task
						inner join business.view_course bvc on cvt.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						where bvut.id_user_task = _ID_USER_TASK;		
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la tarea del estudiante';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_user_task_create_modified(numeric, numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_user_task_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean)
-- DROP FUNCTION IF EXISTS business.dml_user_task_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean);

CREATE OR REPLACE FUNCTION business.dml_user_task_update_modified(
	id_user_ numeric,
	_id_user_task numeric,
	_id_user numeric,
	_id_task numeric,
	_response_user_task character varying,
	_shipping_date_user_task timestamp without time zone,
	_qualification_user_task numeric,
	_is_open boolean,
	_is_dispatched boolean,
	_is_qualified boolean)
    RETURNS TABLE(id_user_task numeric, bvut_id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, cvt_id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, maximum_rating numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_USER_TASK BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_USER_TASK = (select * from business.dml_user_task_update(id_user_, _id_user_task, _id_user, _id_task, _response_user_task, _shipping_date_user_task, _qualification_user_task, _is_open, _is_dispatched, _is_qualified));

			 	IF (_UPDATE_USER_TASK) THEN
					RETURN QUERY select bvut.id_user_task, bvut.id_user as bvut_id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.id_user as cvt_id_user, cvt.name_task, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.maximum_rating from business.view_user_task bvut
						inner join core.view_user cvu on bvut.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						inner join business.view_task cvt  on bvut.id_task = cvt.id_task
						inner join business.view_course bvc on cvt.id_course = bvc.id_course
						inner join business.view_period bvp on bvc.id_period = bvp.id_period
						where bvut.id_user_task = _id_user_task;				
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la tarea';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_user_task_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_attached_create_modified(numeric, numeric, character varying, character varying, character varying, character varying)
-- DROP FUNCTION IF EXISTS business.dml_attached_create_modified(numeric, numeric, character varying, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION business.dml_attached_create_modified(
	id_user_ numeric,
	_id_user_task numeric,
	_file_name character varying,
	_length_mb character varying,
	_extension character varying,
	_server_path character varying)
    RETURNS TABLE(id_attached numeric, id_user_task numeric, file_name character varying, length_mb character varying, extension character varying, server_path character varying, upload_date timestamp without time zone, id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_ATTACHED NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_ATTACHED = (select * from business.dml_attached_create(id_user_, _id_user_task, _file_name, _length_mb, _extension, _server_path, now()::timestamp));

				IF (_ID_ATTACHED >= 1) THEN
					RETURN QUERY select bva.id_attached, bva.id_user_task, bva.file_name, bva.length_mb, bva.extension, bva.server_path, bva.upload_date, bvut.id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.name_task, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_attached bva
						inner join business.view_user_task bvut on bva.id_user_task = bvut.id_user_task
						inner join core.view_user cvu on bvut.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						inner join business.view_task cvt  on bvut.id_task = cvt.id_task
						inner join business.view_course bvc on cvt.id_course = bvc.id_course
						where bva.id_attached = _ID_ATTACHED;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el anexo';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_attached_create_modified(numeric, numeric, character varying, character varying, character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: business.dml_comment_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_comment_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_comment_create_modified(
	id_user_ numeric,
	_id_user_task numeric)
    RETURNS TABLE(id_comment numeric, id_user_task numeric, id_user numeric, value_comment character varying, date_comment timestamp without time zone, deleted_comment boolean, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_COMMENT NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_COMMENT = (select * from business.dml_comment_create(id_user_, _id_user_task, id_user_, '', now()::timestamp, false));

				IF (_ID_COMMENT >= 1) THEN
					RETURN QUERY select bvc.id_comment, bvc.id_user_task, bvc.id_user, bvc.value_comment, bvc.date_comment, bvc.deleted_comment, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_comment bvc
						inner join business.view_user_task bvut on bvc.id_user_task = bvut.id_user_task
						inner join core.view_user cvu on bvc.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvc.id_comment = _ID_COMMENT;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el comentario';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_comment_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_comment_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_comment_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_comment_update_modified(
	id_user_ numeric,
	_id_comment numeric,
	_id_user_task numeric,
	_id_user numeric,
	_value_comment character varying,
	_date_comment timestamp without time zone,
	_deleted_comment boolean)
    RETURNS TABLE(id_comment numeric, id_user_task numeric, id_user numeric, value_comment character varying, date_comment timestamp without time zone, deleted_comment boolean, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_COMMENT BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_COMMENT = (select * from business.dml_comment_update(id_user_, _id_comment, _id_user_task, _id_user, _value_comment, _date_comment, _deleted_comment));

			 	IF (_UPDATE_COMMENT) THEN
					RETURN QUERY select bvc.id_comment, bvc.id_user_task, bvc.id_user, bvc.value_comment, bvc.date_comment, bvc.deleted_comment, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_comment bvc
						inner join business.view_user_task bvut on bvc.id_user_task = bvut.id_user_task
						inner join core.view_user cvu on bvc.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvc.id_comment = _id_comment;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el comentario';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_comment_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_assistance_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_assistance_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_assistance_create_modified(
	id_user_ numeric,
	_id_course numeric)
    RETURNS TABLE(id_assistance numeric, id_user numeric, id_course numeric, start_marking_date timestamp without time zone, end_marking_date timestamp without time zone, is_late boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_ASSISTANCE NUMERIC;
				_IS_LATE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_IS_LATE = (select now()::time  > (select bvs.start_date_schedule from business.view_course bvc inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule where bvc.id_course = _id_course)::time);
				
				_ID_ASSISTANCE = (select * from business.dml_assistance_create(id_user_, id_user_, _id_course, now()::timestamp, null, _IS_LATE));

				IF (_ID_ASSISTANCE >= 1) THEN
					RETURN QUERY select bva.id_assistance, bva.id_user, bva.id_course, bva.start_marking_date, bva.end_marking_date, bva.is_late, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_assistance bva
						inner join business.view_course bvc on bva.id_course = bvc.id_course
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						inner join core.view_user cvu on bva.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bva.id_assistance = _ID_ASSISTANCE;
				ELSE
					_EXCEPTION = 'Ocurrió un error al registrar la asistencia';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_assistance_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_assistance_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_assistance_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_assistance_update_modified(
	id_user_ numeric,
	_id_assistance numeric,
	_id_user numeric,
	_id_course numeric,
	_start_marking_date timestamp without time zone,
	_end_marking_date timestamp without time zone,
	_is_late boolean)
    RETURNS TABLE(id_assistance numeric, id_user numeric, id_course numeric, start_marking_date timestamp without time zone, end_marking_date timestamp without time zone, is_late boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_ASSISTANCE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_ASSISTANCE = (select * from business.dml_assistance_update(id_user_, _id_assistance, _id_user, _id_course, _start_marking_date, now()::timestamp, _is_late));

			 	IF (_UPDATE_ASSISTANCE) THEN
					RETURN QUERY select bva.id_assistance, bva.id_user, bva.id_course, bva.start_marking_date, bva.end_marking_date, bva.is_late, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_assistance bva
						inner join business.view_course bvc on bva.id_course = bvc.id_course
						inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
						inner join core.view_user cvu on bva.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bva.id_assistance = _id_assistance;
				ELSE
					_EXCEPTION = 'Ocurrió un error al registrar la asistencia';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_assistance_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_quimester_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_quimester_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_quimester_create_modified(
	id_user_ numeric,
	_id_period numeric)
    RETURNS TABLE(id_quimester numeric, id_period numeric, name_quimester character varying, description_quimester character varying, deleted_quimester boolean, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_QUIMESTER NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_QUIMESTER = (select * from business.dml_quimester_create(id_user_, _id_period, 'Nuevo quimestre', '', false));

				IF (_ID_QUIMESTER >= 1) THEN
					RETURN QUERY select bvq.id_quimester, bvq.id_period, bvq.name_quimester, bvq.description_quimester, bvq.deleted_quimester, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period from business.view_quimester bvq
						inner join business.view_period bvp on bvq.id_period = bvp.id_period
						where bvq.id_quimester = _ID_QUIMESTER;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar quimester';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_quimester_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_quimester_update_modified(numeric, numeric, numeric, character varying, character varying, boolean)
-- DROP FUNCTION IF EXISTS business.dml_quimester_update_modified(numeric, numeric, numeric, character varying, character varying, boolean);

CREATE OR REPLACE FUNCTION business.dml_quimester_update_modified(
	id_user_ numeric,
	_id_quimester numeric,
	_id_period numeric,
	_name_quimester character varying,
	_description_quimester character varying,
	_deleted_quimester boolean)
    RETURNS TABLE(id_quimester numeric, id_period numeric, name_quimester character varying, description_quimester character varying, deleted_quimester boolean, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_QUIMESTER BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_QUIMESTER = (select * from business.dml_quimester_update(id_user_, _id_quimester, _id_period, _name_quimester, _description_quimester, _deleted_quimester));

			 	IF (_UPDATE_QUIMESTER) THEN
					RETURN QUERY select bvq.id_quimester, bvq.id_period, bvq.name_quimester, bvq.description_quimester, bvq.deleted_quimester, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period from business.view_quimester bvq
						inner join business.view_period bvp on bvq.id_period = bvp.id_period
						where bvq.id_quimester = _id_quimester;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar quimester';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_quimester_update_modified(numeric, numeric, numeric, character varying, character varying, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_partial_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_partial_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_partial_create_modified(
	id_user_ numeric,
	_id_quimester numeric)
    RETURNS TABLE(id_partial numeric, id_quimester numeric, name_partial character varying, description_partial character varying, deleted_partial boolean, id_period numeric, name_quimester character varying, description_quimester character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_PARTIAL NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_PARTIAL = (select * from business.dml_partial_create(id_user_, _id_quimester, 'Nuevo parcial', '', false));

				IF (_ID_PARTIAL >= 1) THEN
					RETURN QUERY select bvp.id_partial, bvp.id_quimester, bvp.name_partial, bvp.description_partial, bvp.deleted_partial, bvq.id_period, bvq.name_quimester, bvq.description_quimester from business.view_partial bvp
						inner join business.view_quimester bvq on bvp.id_quimester = bvq.id_quimester
						where bvp.id_partial = _ID_PARTIAL;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar partial';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_partial_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_partial_update_modified(numeric, numeric, numeric, character varying, character varying, boolean)
-- DROP FUNCTION IF EXISTS business.dml_partial_update_modified(numeric, numeric, numeric, character varying, character varying, boolean);

CREATE OR REPLACE FUNCTION business.dml_partial_update_modified(
	id_user_ numeric,
	_id_partial numeric,
	_id_quimester numeric,
	_name_partial character varying,
	_description_partial character varying,
	_deleted_partial boolean)
    RETURNS TABLE(id_partial numeric, id_quimester numeric, name_partial character varying, description_partial character varying, deleted_partial boolean, id_period numeric, name_quimester character varying, description_quimester character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_PARTIAL BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_PARTIAL = (select * from business.dml_partial_update(id_user_, _id_partial, _id_quimester, _name_partial, _description_partial, _deleted_partial));

			 	IF (_UPDATE_PARTIAL) THEN
					RETURN QUERY select bvp.id_partial, bvp.id_quimester, bvp.name_partial, bvp.description_partial, bvp.deleted_partial, bvq.id_period, bvq.name_quimester, bvq.description_quimester from business.view_partial bvp
						inner join business.view_quimester bvq on bvp.id_quimester = bvq.id_quimester
						where bvp.id_partial = _id_partial;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar partial';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_partial_update_modified(numeric, numeric, numeric, character varying, character varying, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_resource_course_create_modified(numeric, numeric, numeric, character varying, character varying, character varying, character varying)
-- DROP FUNCTION IF EXISTS business.dml_resource_course_create_modified(numeric, numeric, numeric, character varying, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION business.dml_resource_course_create_modified(
	id_user_ numeric,
	_id_course numeric,
	_id_user numeric,
	_file_name character varying,
	_length_mb character varying,
	_extension character varying,
	_server_path character varying)
    RETURNS TABLE(id_resource_course numeric, id_course numeric, id_user numeric, file_name character varying, length_mb character varying, extension character varying, server_path character varying, upload_date timestamp with time zone, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_RESOURCE_COURSE NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_RESOURCE_COURSE = (select * from business.dml_resource_course_create(id_user_, _id_course, _id_user, _file_name, _length_mb, _extension, _server_path, now()::timestamp));

				IF (_ID_RESOURCE_COURSE >= 1) THEN
					RETURN QUERY select bvrc.id_resource_course, bvrc.id_course, bvrc.id_user, bvrc.file_name, bvrc.length_mb, bvrc.extension, bvrc.server_path, bvrc.upload_date, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_resource_course bvrc
						inner join business.view_course bvc on bvrc.id_course = bvc.id_course
						where bvrc.id_resource_course = _ID_RESOURCE_COURSE;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar resource_course';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_resource_course_create_modified(numeric, numeric, numeric, character varying, character varying, character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: business.dml_forum_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_forum_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_forum_create_modified(
	id_user_ numeric,
	_id_course numeric)
    RETURNS TABLE(id_forum numeric, id_course numeric, id_user numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, deleted_forum boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_FORUM NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_FORUM = (select * from business.dml_forum_create(id_user_, _id_course, id_user_, 'Nuevo foro', '', now()::timestamp, false));

				IF (_ID_FORUM >= 1) THEN
					RETURN QUERY select bvf.id_forum, bvf.id_course, bvf.id_user, bvf.title_forum, bvf.description_forum, bvf.date_forum, bvf.deleted_forum, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_forum bvf
						inner join business.view_course bvc on bvf.id_course = bvc.id_course
						inner join core.view_user cvu on bvf.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvf.id_forum = _ID_FORUM;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar forum';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_forum_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_forum_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_forum_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_forum_update_modified(
	id_user_ numeric,
	_id_forum numeric,
	_id_course numeric,
	_id_user numeric,
	_title_forum character varying,
	_description_forum character varying,
	_date_forum timestamp with time zone,
	_deleted_forum boolean)
    RETURNS TABLE(id_forum numeric, id_course numeric, id_user numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, deleted_forum boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_FORUM BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_FORUM = (select * from business.dml_forum_update(id_user_, _id_forum, _id_course, _id_user, _title_forum, _description_forum, _date_forum, _deleted_forum));

			 	IF (_UPDATE_FORUM) THEN
					RETURN QUERY select bvf.id_forum, bvf.id_course, bvf.id_user, bvf.title_forum, bvf.description_forum, bvf.date_forum, bvf.deleted_forum, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_forum bvf
						inner join business.view_course bvc on bvf.id_course = bvc.id_course
						inner join core.view_user cvu on bvf.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvf.id_forum = _id_forum; 
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar forum';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_forum_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_comment_forum_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_comment_forum_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_comment_forum_create_modified(
	id_user_ numeric,
	_id_forum numeric)
    RETURNS TABLE(id_comment_forum numeric, id_forum numeric, id_user numeric, value_comment_forum character varying, date_comment_forum timestamp with time zone, deleted_comment_forum boolean, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_COMMENT_FORUM NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_COMMENT_FORUM = (select * from business.dml_comment_forum_create(id_user_, _id_forum, id_user_, 'Nuevo comentario', now()::timestamp, false));

				IF (_ID_COMMENT_FORUM >= 1) THEN
					RETURN QUERY select bvcf.id_comment_forum, bvcf.id_forum, bvcf.id_user, bvcf.value_comment_forum, bvcf.date_comment_forum, bvcf.deleted_comment_forum, bvf.id_course, bvf.title_forum, bvf.description_forum, bvf.date_forum, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_comment_forum bvcf
						inner join business.view_forum bvf on bvcf.id_forum = bvf.id_forum
						inner join core.view_user cvu on bvcf.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvcf.id_comment_forum = _ID_COMMENT_FORUM;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar comment_forum';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_comment_forum_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_comment_forum_update_modified(numeric, numeric, numeric, character varying, boolean)
-- DROP FUNCTION IF EXISTS business.dml_comment_forum_update_modified(numeric, numeric, numeric, character varying, boolean);

CREATE OR REPLACE FUNCTION business.dml_comment_forum_update_modified(
	id_user_ numeric,
	_id_comment_forum numeric,
	_id_forum numeric,
	_value_comment_forum character varying,
	_deleted_comment_forum boolean)
    RETURNS TABLE(id_comment_forum numeric, id_forum numeric, id_user numeric, value_comment_forum character varying, date_comment_forum timestamp with time zone, deleted_comment_forum boolean, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_COMMENT_FORUM BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_COMMENT_FORUM = (select * from business.dml_comment_forum_update(id_user_, _id_comment_forum, _id_forum, id_user_, _value_comment_forum, now()::timestamp, _deleted_comment_forum));

			 	IF (_UPDATE_COMMENT_FORUM) THEN
					RETURN QUERY select bvcf.id_comment_forum, bvcf.id_forum, bvcf.id_user, bvcf.value_comment_forum, bvcf.date_comment_forum, bvcf.deleted_comment_forum, bvf.id_course, bvf.title_forum, bvf.description_forum, bvf.date_forum, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person from business.view_comment_forum bvcf
						inner join business.view_forum bvf on bvcf.id_forum = bvf.id_forum
						inner join core.view_user cvu on bvcf.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where bvcf.id_comment_forum = _id_comment_forum;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar comment_forum';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_comment_forum_update_modified(numeric, numeric, numeric, character varying, boolean)
    OWNER TO postgres;

-- FUNCTION: business.dml_glossary_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_glossary_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_glossary_create_modified(
	id_user_ numeric,
	_id_course numeric)
    RETURNS TABLE(id_glossary numeric, id_course numeric, term_glossary character varying, concept_glossary character varying, date_glossary timestamp with time zone, deleted_glossary boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_GLOSSARY NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_GLOSSARY = (select * from business.dml_glossary_create(id_user_, _id_course, 'Nuevo termino', '', now()::timestamp, false));

				IF (_ID_GLOSSARY >= 1) THEN
					RETURN QUERY select bvg.id_glossary, bvg.id_course, bvg.term_glossary, bvg.concept_glossary, bvg.date_glossary, bvg.deleted_glossary, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_glossary bvg
						inner join business.view_course bvc on bvg.id_course = bvc.id_course
						where bvg.id_glossary = _ID_GLOSSARY;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar glossary';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_glossary_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_glossary_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS business.dml_glossary_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION business.dml_glossary_create_modified(
	id_user_ numeric,
	_id_course numeric)
    RETURNS TABLE(id_glossary numeric, id_course numeric, term_glossary character varying, concept_glossary character varying, date_glossary timestamp with time zone, deleted_glossary boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_GLOSSARY NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_GLOSSARY = (select * from business.dml_glossary_create(id_user_, _id_course, 'Nuevo termino', '', now()::timestamp, false));

				IF (_ID_GLOSSARY >= 1) THEN
					RETURN QUERY select bvg.id_glossary, bvg.id_course, bvg.term_glossary, bvg.concept_glossary, bvg.date_glossary, bvg.deleted_glossary, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_glossary bvg
						inner join business.view_course bvc on bvg.id_course = bvc.id_course
						where bvg.id_glossary = _ID_GLOSSARY;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar glossary';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$BODY$;

ALTER FUNCTION business.dml_glossary_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: business.dml_glossary_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
-- DROP FUNCTION IF EXISTS business.dml_glossary_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean);

CREATE OR REPLACE FUNCTION business.dml_glossary_update_modified(
	id_user_ numeric,
	_id_glossary numeric,
	_id_course numeric,
	_term_glossary character varying,
	_concept_glossary character varying,
	_date_glossary timestamp with time zone,
	_deleted_glossary boolean)
    RETURNS TABLE(id_glossary numeric, id_course numeric, term_glossary character varying, concept_glossary character varying, date_glossary timestamp with time zone, deleted_glossary boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_GLOSSARY BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_GLOSSARY = (select * from business.dml_glossary_update(id_user_, _id_glossary, _id_course, _term_glossary, _concept_glossary, _date_glossary, _deleted_glossary));

			 	IF (_UPDATE_GLOSSARY) THEN
					RETURN QUERY select bvg.id_glossary, bvg.id_course, bvg.term_glossary, bvg.concept_glossary, bvg.date_glossary, bvg.deleted_glossary, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_glossary bvg
						inner join business.view_course bvc on bvg.id_course = bvc.id_course
						where bvg.id_glossary = _id_glossary;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar glossary';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$BODY$;

ALTER FUNCTION business.dml_glossary_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
    OWNER TO postgres;
