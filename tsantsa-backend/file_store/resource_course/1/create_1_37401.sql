--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4
-- Dumped by pg_dump version 13.4

-- Started on 2022-05-09 11:06:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 8 (class 2615 OID 220331)
-- Name: business; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA business;


ALTER SCHEMA business OWNER TO postgres;

--
-- TOC entry 4 (class 2615 OID 220300)
-- Name: core; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA core;


ALTER SCHEMA core OWNER TO postgres;

--
-- TOC entry 7 (class 2615 OID 220299)
-- Name: dev; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA dev;


ALTER SCHEMA dev OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 220707)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA core;


--
-- TOC entry 3715 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 933 (class 1247 OID 220302)
-- Name: TYPE_NAVIGATION; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core."TYPE_NAVIGATION" AS ENUM (
    'defaultNavigation',
    'compactNavigation',
    'futuristicNavigation',
    'horizontalNavigation'
);


ALTER TYPE core."TYPE_NAVIGATION" OWNER TO postgres;

--
-- TOC entry 942 (class 1247 OID 220326)
-- Name: TYPE_PROFILE; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core."TYPE_PROFILE" AS ENUM (
    'administator',
    'commonProfile'
);


ALTER TYPE core."TYPE_PROFILE" OWNER TO postgres;

--
-- TOC entry 939 (class 1247 OID 220320)
-- Name: TYPE_USER; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core."TYPE_USER" AS ENUM (
    'student',
    'teacher'
);


ALTER TYPE core."TYPE_USER" OWNER TO postgres;

--
-- TOC entry 936 (class 1247 OID 220312)
-- Name: TYPE_VALIDATION; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core."TYPE_VALIDATION" AS ENUM (
    'validationPassword',
    'validationDNI',
    'validationPhoneNumber'
);


ALTER TYPE core."TYPE_VALIDATION" OWNER TO postgres;

--
-- TOC entry 456 (class 1255 OID 221109)
-- Name: dml_assistance_create(numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_assistance_create(id_user_ numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_assistance')-1);
				_COUNT = (select count(*) from business.view_assistance t where t.id_assistance = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO business.assistance(id_assistance, id_user, id_course, start_marking_date, end_marking_date, is_late) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_assistance LOOP
						_RETURNIG = _X.id_assistance;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'assistance',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_assistance'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_assistance_create(id_user_ numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) OWNER TO postgres;

--
-- TOC entry 507 (class 1255 OID 221209)
-- Name: dml_assistance_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_assistance_create_modified(id_user_ numeric, _id_course numeric) RETURNS TABLE(id_assistance numeric, id_user numeric, id_course numeric, start_marking_date timestamp without time zone, end_marking_date timestamp without time zone, is_late boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_assistance_create_modified(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 458 (class 1255 OID 221111)
-- Name: dml_assistance_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_assistance_delete(id_user_ numeric, _id_assistance numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_assistance t where t.id_assistance = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','assistance', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM business.assistance WHERE id_assistance = $2 RETURNING id_assistance LOOP
							_RETURNIG = _X.id_assistance;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'assistance',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_assistance_delete(id_user_ numeric, _id_assistance numeric) OWNER TO postgres;

--
-- TOC entry 457 (class 1255 OID 221110)
-- Name: dml_assistance_update(numeric, numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_assistance_update(id_user_ numeric, _id_assistance numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from business.view_assistance t where t.id_assistance = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE business.assistance SET id_user=$3, id_course=$4, start_marking_date=$5, end_marking_date=$6, is_late=$7 WHERE id_assistance=$2 RETURNING id_assistance LOOP
						_RETURNIG = _X.id_assistance;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'assistance',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_assistance_update(id_user_ numeric, _id_assistance numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) OWNER TO postgres;

--
-- TOC entry 508 (class 1255 OID 221210)
-- Name: dml_assistance_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_assistance_update_modified(id_user_ numeric, _id_assistance numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) RETURNS TABLE(id_assistance numeric, id_user numeric, id_course numeric, start_marking_date timestamp without time zone, end_marking_date timestamp without time zone, is_late boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_assistance_update_modified(id_user_ numeric, _id_assistance numeric, _id_user numeric, _id_course numeric, _start_marking_date timestamp without time zone, _end_marking_date timestamp without time zone, _is_late boolean) OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 221136)
-- Name: dml_attached_create(numeric, numeric, character varying, character varying, character varying, character varying, timestamp without time zone); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_attached_create(id_user_ numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp without time zone) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- user_task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_user_task v where v.id_user_task = _id_user_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user_task||' de la tabla user_task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_attached')-1);
				_COUNT = (select count(*) from business.view_attached t where t.id_attached = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO business.attached(id_attached, id_user_task, file_name, length_mb, extension, server_path, upload_date) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_attached LOOP
						_RETURNIG = _X.id_attached;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'attached',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_attached'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_attached_create(id_user_ numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 504 (class 1255 OID 221206)
-- Name: dml_attached_create_modified(numeric, numeric, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_attached_create_modified(id_user_ numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying) RETURNS TABLE(id_attached numeric, id_user_task numeric, file_name character varying, length_mb character varying, extension character varying, server_path character varying, upload_date timestamp without time zone, id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_attached_create_modified(id_user_ numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying) OWNER TO postgres;

--
-- TOC entry 428 (class 1255 OID 221138)
-- Name: dml_attached_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_attached_delete(id_user_ numeric, _id_attached numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_attached t where t.id_attached = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','attached', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM business.attached WHERE id_attached = $2 RETURNING id_attached LOOP
							_RETURNIG = _X.id_attached;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'attached',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_attached_delete(id_user_ numeric, _id_attached numeric) OWNER TO postgres;

--
-- TOC entry 484 (class 1255 OID 221137)
-- Name: dml_attached_update(numeric, numeric, numeric, character varying, character varying, character varying, character varying, timestamp without time zone); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_attached_update(id_user_ numeric, _id_attached numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp without time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- user_task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_user_task v where v.id_user_task = _id_user_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user_task||' de la tabla user_task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from business.view_attached t where t.id_attached = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE business.attached SET id_user_task=$3, file_name=$4, length_mb=$5, extension=$6, server_path=$7, upload_date=$8 WHERE id_attached=$2 RETURNING id_attached LOOP
						_RETURNIG = _X.id_attached;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'attached',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_attached_update(id_user_ numeric, _id_attached numeric, _id_user_task numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 445 (class 1255 OID 221097)
-- Name: dml_career_create(numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_career_create(id_user_ numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_career')-1);
				_COUNT = (select count(*) from business.view_career t where t.id_career = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_career t where t.name_career = _name_career);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.career(id_career, id_company, name_career, description_career, status_career, creation_date_career, deleted_career) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_career LOOP
							_RETURNIG = _X.id_career;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'career',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_career '||_name_career||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_career'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_career_create(id_user_ numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) OWNER TO postgres;

--
-- TOC entry 490 (class 1255 OID 221192)
-- Name: dml_career_create_modified(numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_career_create_modified(id_user_ numeric) RETURNS TABLE(id_career numeric, id_company numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, deleted_career boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_career_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 447 (class 1255 OID 221099)
-- Name: dml_career_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_career_delete(id_user_ numeric, _id_career numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_career t where t.id_career = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_career t where t.id_career = $2 and deleted_career = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','career', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.career SET deleted_career=true WHERE id_career = $2 RETURNING id_career LOOP
								_RETURNIG = _X.id_career;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'career',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_career_delete(id_user_ numeric, _id_career numeric) OWNER TO postgres;

--
-- TOC entry 446 (class 1255 OID 221098)
-- Name: dml_career_update(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_career_update(id_user_ numeric, _id_career numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_career t where t.id_career = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_career t where t.id_career = $2 and deleted_career = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_career t where t.name_career = _name_career and t.id_career != _id_career);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.career SET id_company=$3, name_career=$4, description_career=$5, status_career=$6, creation_date_career=$7, deleted_career=$8 WHERE id_career=$2 RETURNING id_career LOOP
								_RETURNIG = _X.id_career;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'career',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el name_career '||_name_career||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_career_update(id_user_ numeric, _id_career numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) OWNER TO postgres;

--
-- TOC entry 491 (class 1255 OID 221193)
-- Name: dml_career_update_modified(numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_career_update_modified(id_user_ numeric, _id_career numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) RETURNS TABLE(id_career numeric, id_company numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, deleted_career boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_career_update_modified(id_user_ numeric, _id_career numeric, _id_company numeric, _name_career character varying, _description_career character varying, _status_career boolean, _creation_date_career timestamp without time zone, _deleted_career boolean) OWNER TO postgres;

--
-- TOC entry 485 (class 1255 OID 221139)
-- Name: dml_comment_create(numeric, numeric, numeric, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_create(id_user_ numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- user_task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_user_task v where v.id_user_task = _id_user_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user_task||' de la tabla user_task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_comment')-1);
				_COUNT = (select count(*) from business.view_comment t where t.id_comment = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_comment t where t.id_comment = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.comment(id_comment, id_user_task, id_user, value_comment, date_comment, deleted_comment) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_comment LOOP
							_RETURNIG = _X.id_comment;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'comment',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_comment '||_id_comment||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_comment'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_comment_create(id_user_ numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) OWNER TO postgres;

--
-- TOC entry 505 (class 1255 OID 221207)
-- Name: dml_comment_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_create_modified(id_user_ numeric, _id_user_task numeric) RETURNS TABLE(id_comment numeric, id_user_task numeric, id_user numeric, value_comment character varying, date_comment timestamp without time zone, deleted_comment boolean, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_comment_create_modified(id_user_ numeric, _id_user_task numeric) OWNER TO postgres;

--
-- TOC entry 487 (class 1255 OID 221141)
-- Name: dml_comment_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_delete(id_user_ numeric, _id_comment numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_comment t where t.id_comment = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_comment t where t.id_comment = $2 and deleted_comment = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','comment', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.comment SET deleted_comment=true WHERE id_comment = $2 RETURNING id_comment LOOP
								_RETURNIG = _X.id_comment;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'comment',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_comment_delete(id_user_ numeric, _id_comment numeric) OWNER TO postgres;

--
-- TOC entry 480 (class 1255 OID 221133)
-- Name: dml_comment_forum_create(numeric, numeric, numeric, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_create(id_user_ numeric, _id_forum numeric, _id_user numeric, _value_comment_forum character varying, _date_comment_forum timestamp with time zone, _deleted_comment_forum boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- forum
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_forum v where v.id_forum = _id_forum);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_forum||' de la tabla forum no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_comment_forum')-1);
				_COUNT = (select count(*) from business.view_comment_forum t where t.id_comment_forum = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_comment_forum t where t.id_comment_forum = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.comment_forum(id_comment_forum, id_forum, id_user, value_comment_forum, date_comment_forum, deleted_comment_forum) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_comment_forum LOOP
							_RETURNIG = _X.id_comment_forum;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'comment_forum',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_comment_forum '||_id_comment_forum||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_comment_forum'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_comment_forum_create(id_user_ numeric, _id_forum numeric, _id_user numeric, _value_comment_forum character varying, _date_comment_forum timestamp with time zone, _deleted_comment_forum boolean) OWNER TO postgres;

--
-- TOC entry 517 (class 1255 OID 221223)
-- Name: dml_comment_forum_create_modified(numeric, numeric, character varying); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_create_modified(id_user_ numeric, _id_forum numeric, _value_comment_forum character varying) RETURNS TABLE(id_comment_forum numeric, id_forum numeric, id_user numeric, value_comment_forum character varying, date_comment_forum timestamp with time zone, deleted_comment_forum boolean, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMMENT_FORUM NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_COMMENT_FORUM = (select * from business.dml_comment_forum_create(id_user_, _id_forum, id_user_, _value_comment_forum, now()::timestamp, false));

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
			
$$;


ALTER FUNCTION business.dml_comment_forum_create_modified(id_user_ numeric, _id_forum numeric, _value_comment_forum character varying) OWNER TO postgres;

--
-- TOC entry 482 (class 1255 OID 221135)
-- Name: dml_comment_forum_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_delete(id_user_ numeric, _id_comment_forum numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_comment_forum t where t.id_comment_forum = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_comment_forum t where t.id_comment_forum = $2 and deleted_comment_forum = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','comment_forum', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.comment_forum SET deleted_comment_forum=true WHERE id_comment_forum = $2 RETURNING id_comment_forum LOOP
								_RETURNIG = _X.id_comment_forum;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'comment_forum',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_comment_forum_delete(id_user_ numeric, _id_comment_forum numeric) OWNER TO postgres;

--
-- TOC entry 516 (class 1255 OID 221221)
-- Name: dml_comment_forum_delete_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_delete_modified(id_user_ numeric, _id_comment_forum numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
			 DECLARE
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	-- Obtener los ids de los registros que se eliminaran
				-- select * from dev.utils_get_columns_type('business', '')
				
				-- Eliminar registros en cascada
				
				-- Retornar true
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 $$;


ALTER FUNCTION business.dml_comment_forum_delete_modified(id_user_ numeric, _id_comment_forum numeric) OWNER TO postgres;

--
-- TOC entry 481 (class 1255 OID 221134)
-- Name: dml_comment_forum_update(numeric, numeric, numeric, numeric, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_update(id_user_ numeric, _id_comment_forum numeric, _id_forum numeric, _id_user numeric, _value_comment_forum character varying, _date_comment_forum timestamp with time zone, _deleted_comment_forum boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- forum
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_forum v where v.id_forum = _id_forum);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_forum||' de la tabla forum no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_comment_forum t where t.id_comment_forum = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_comment_forum t where t.id_comment_forum = $2 and deleted_comment_forum = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_comment_forum t where t.id_comment_forum = _id_comment_forum and t.id_comment_forum != _id_comment_forum);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.comment_forum SET id_forum=$3, id_user=$4, value_comment_forum=$5, date_comment_forum=$6, deleted_comment_forum=$7 WHERE id_comment_forum=$2 RETURNING id_comment_forum LOOP
								_RETURNIG = _X.id_comment_forum;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'comment_forum',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_comment_forum '||_id_comment_forum||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_comment_forum_update(id_user_ numeric, _id_comment_forum numeric, _id_forum numeric, _id_user numeric, _value_comment_forum character varying, _date_comment_forum timestamp with time zone, _deleted_comment_forum boolean) OWNER TO postgres;

--
-- TOC entry 518 (class 1255 OID 221224)
-- Name: dml_comment_forum_update_modified(numeric, numeric, numeric, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_forum_update_modified(id_user_ numeric, _id_comment_forum numeric, _id_forum numeric, _value_comment_forum character varying, _deleted_comment_forum boolean) RETURNS TABLE(id_comment_forum numeric, id_forum numeric, id_user numeric, value_comment_forum character varying, date_comment_forum timestamp with time zone, deleted_comment_forum boolean, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_comment_forum_update_modified(id_user_ numeric, _id_comment_forum numeric, _id_forum numeric, _value_comment_forum character varying, _deleted_comment_forum boolean) OWNER TO postgres;

--
-- TOC entry 486 (class 1255 OID 221140)
-- Name: dml_comment_update(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_update(id_user_ numeric, _id_comment numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- user_task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_user_task v where v.id_user_task = _id_user_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user_task||' de la tabla user_task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_comment t where t.id_comment = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_comment t where t.id_comment = $2 and deleted_comment = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_comment t where t.id_comment = _id_comment and t.id_comment != _id_comment);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.comment SET id_user_task=$3, id_user=$4, value_comment=$5, date_comment=$6, deleted_comment=$7 WHERE id_comment=$2 RETURNING id_comment LOOP
								_RETURNIG = _X.id_comment;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'comment',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_comment '||_id_comment||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_comment_update(id_user_ numeric, _id_comment numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) OWNER TO postgres;

--
-- TOC entry 506 (class 1255 OID 221208)
-- Name: dml_comment_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_comment_update_modified(id_user_ numeric, _id_comment numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) RETURNS TABLE(id_comment numeric, id_user_task numeric, id_user numeric, value_comment character varying, date_comment timestamp without time zone, deleted_comment boolean, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_comment_update_modified(id_user_ numeric, _id_comment numeric, _id_user_task numeric, _id_user numeric, _value_comment character varying, _date_comment timestamp without time zone, _deleted_comment boolean) OWNER TO postgres;

--
-- TOC entry 443 (class 1255 OID 221094)
-- Name: dml_course_create(numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_create(id_user_ numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- period
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_period v where v.id_period = _id_period);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_period||' de la tabla period no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- career
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_career v where v.id_career = _id_career);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_career||' de la tabla career no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- schedule
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_schedule v where v.id_schedule = _id_schedule);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_schedule||' de la tabla schedule no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_course')-1);
				_COUNT = (select count(*) from business.view_course t where t.id_course = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_course t where t.name_course = _name_course);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.course(id_course, id_company, id_period, id_career, id_schedule, name_course, description_course, status_course, creation_date_course, deleted_course) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10 ) RETURNING id_course LOOP
							_RETURNIG = _X.id_course;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'course',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_course '||_name_course||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_course'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_course_create(id_user_ numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean) OWNER TO postgres;

--
-- TOC entry 492 (class 1255 OID 221194)
-- Name: dml_course_create_modified(numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_create_modified(id_user_ numeric) RETURNS TABLE(id_course numeric, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, deleted_course boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_course_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 423 (class 1255 OID 221096)
-- Name: dml_course_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_delete(id_user_ numeric, _id_course numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_course t where t.id_course = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_course t where t.id_course = $2 and deleted_course = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','course', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.course SET deleted_course=true WHERE id_course = $2 RETURNING id_course LOOP
								_RETURNIG = _X.id_course;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'course',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_course_delete(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 494 (class 1255 OID 221196)
-- Name: dml_course_delete_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_delete_modified(id_user_ numeric, _id_course numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_course_delete_modified(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 444 (class 1255 OID 221095)
-- Name: dml_course_update(numeric, numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_update(id_user_ numeric, _id_course numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- period
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_period v where v.id_period = _id_period);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_period||' de la tabla period no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- career
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_career v where v.id_career = _id_career);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_career||' de la tabla career no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- schedule
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_schedule v where v.id_schedule = _id_schedule);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_schedule||' de la tabla schedule no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_course t where t.id_course = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_course t where t.id_course = $2 and deleted_course = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_course t where t.name_course = _name_course and t.id_course != _id_course);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.course SET id_company=$3, id_period=$4, id_career=$5, id_schedule=$6, name_course=$7, description_course=$8, status_course=$9, creation_date_course=$10, deleted_course=$11 WHERE id_course=$2 RETURNING id_course LOOP
								_RETURNIG = _X.id_course;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'course',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el name_course '||_name_course||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_course_update(id_user_ numeric, _id_course numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean) OWNER TO postgres;

--
-- TOC entry 493 (class 1255 OID 221195)
-- Name: dml_course_update_modified(numeric, numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, boolean, time without time zone, time without time zone, numeric, timestamp without time zone); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_course_update_modified(id_user_ numeric, _id_course numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone) RETURNS TABLE(id_course numeric, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, deleted_course boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_course_update_modified(id_user_ numeric, _id_course numeric, _id_company numeric, _id_period numeric, _id_career numeric, _id_schedule numeric, _name_course character varying, _description_course character varying, _status_course boolean, _creation_date_course timestamp without time zone, _deleted_course boolean, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone) OWNER TO postgres;

--
-- TOC entry 448 (class 1255 OID 221100)
-- Name: dml_enrollment_create(numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_enrollment_create(id_user_ numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_enrollment')-1);
				_COUNT = (select count(*) from business.view_enrollment t where t.id_enrollment = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_enrollment t where t.id_enrollment = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.enrollment(id_enrollment, id_course, id_user, date_enrollment, status_enrollment, completed_course, deleted_enrollment) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_enrollment LOOP
							_RETURNIG = _X.id_enrollment;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'enrollment',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_enrollment '||_id_enrollment||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_enrollment'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_enrollment_create(id_user_ numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) OWNER TO postgres;

--
-- TOC entry 495 (class 1255 OID 221197)
-- Name: dml_enrollment_create_modified(numeric, numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_enrollment_create_modified(id_user_ numeric, _id_course numeric, _id_user numeric) RETURNS TABLE(id_enrollment numeric, id_course numeric, id_user numeric, date_enrollment timestamp without time zone, status_enrollment boolean, completed_course boolean, deleted_enrollment boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_enrollment_create_modified(id_user_ numeric, _id_course numeric, _id_user numeric) OWNER TO postgres;

--
-- TOC entry 439 (class 1255 OID 221102)
-- Name: dml_enrollment_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_enrollment_delete(id_user_ numeric, _id_enrollment numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_enrollment t where t.id_enrollment = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_enrollment t where t.id_enrollment = $2 and deleted_enrollment = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','enrollment', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.enrollment SET deleted_enrollment=true WHERE id_enrollment = $2 RETURNING id_enrollment LOOP
								_RETURNIG = _X.id_enrollment;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'enrollment',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_enrollment_delete(id_user_ numeric, _id_enrollment numeric) OWNER TO postgres;

--
-- TOC entry 449 (class 1255 OID 221101)
-- Name: dml_enrollment_update(numeric, numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_enrollment_update(id_user_ numeric, _id_enrollment numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_enrollment t where t.id_enrollment = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_enrollment t where t.id_enrollment = $2 and deleted_enrollment = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_enrollment t where t.id_enrollment = _id_enrollment and t.id_enrollment != _id_enrollment);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.enrollment SET id_course=$3, id_user=$4, date_enrollment=$5, status_enrollment=$6, completed_course=$7, deleted_enrollment=$8 WHERE id_enrollment=$2 RETURNING id_enrollment LOOP
								_RETURNIG = _X.id_enrollment;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'enrollment',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_enrollment '||_id_enrollment||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_enrollment_update(id_user_ numeric, _id_enrollment numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) OWNER TO postgres;

--
-- TOC entry 496 (class 1255 OID 221198)
-- Name: dml_enrollment_update_modified(numeric, numeric, numeric, numeric, timestamp without time zone, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_enrollment_update_modified(id_user_ numeric, _id_enrollment numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) RETURNS TABLE(id_enrollment numeric, id_course numeric, id_user numeric, date_enrollment timestamp without time zone, status_enrollment boolean, completed_course boolean, deleted_enrollment boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_enrollment_update_modified(id_user_ numeric, _id_enrollment numeric, _id_course numeric, _id_user numeric, _date_enrollment timestamp without time zone, _status_enrollment boolean, _completed_course boolean, _deleted_enrollment boolean) OWNER TO postgres;

--
-- TOC entry 465 (class 1255 OID 221118)
-- Name: dml_forum_create(numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_forum_create(id_user_ numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_forum')-1);
				_COUNT = (select count(*) from business.view_forum t where t.id_forum = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_forum t where t.id_forum = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.forum(id_forum, id_course, title_forum, description_forum, date_forum, deleted_forum) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_forum LOOP
							_RETURNIG = _X.id_forum;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'forum',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_forum '||_id_forum||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_forum'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_forum_create(id_user_ numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) OWNER TO postgres;

--
-- TOC entry 514 (class 1255 OID 221216)
-- Name: dml_forum_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_forum_create_modified(id_user_ numeric, _id_course numeric) RETURNS TABLE(id_forum numeric, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, deleted_forum boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_FORUM NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_FORUM = (select * from business.dml_forum_create(id_user_, _id_course, 'Nuevo foro', '', now()::timestamp, false));

				IF (_ID_FORUM >= 1) THEN
					RETURN QUERY select bvf.id_forum, bvf.id_course, bvf.title_forum, bvf.description_forum, bvf.date_forum, bvf.deleted_forum, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_forum bvf
						inner join business.view_course bvc on bvf.id_course = bvc.id_course
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
			
$$;


ALTER FUNCTION business.dml_forum_create_modified(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 467 (class 1255 OID 221120)
-- Name: dml_forum_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_forum_delete(id_user_ numeric, _id_forum numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_forum t where t.id_forum = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_forum t where t.id_forum = $2 and deleted_forum = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','forum', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.forum SET deleted_forum=true WHERE id_forum = $2 RETURNING id_forum LOOP
								_RETURNIG = _X.id_forum;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'forum',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_forum_delete(id_user_ numeric, _id_forum numeric) OWNER TO postgres;

--
-- TOC entry 466 (class 1255 OID 221119)
-- Name: dml_forum_update(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_forum_update(id_user_ numeric, _id_forum numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_forum t where t.id_forum = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_forum t where t.id_forum = $2 and deleted_forum = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_forum t where t.id_forum = _id_forum and t.id_forum != _id_forum);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.forum SET id_course=$3, title_forum=$4, description_forum=$5, date_forum=$6, deleted_forum=$7 WHERE id_forum=$2 RETURNING id_forum LOOP
								_RETURNIG = _X.id_forum;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'forum',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_forum '||_id_forum||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_forum_update(id_user_ numeric, _id_forum numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) OWNER TO postgres;

--
-- TOC entry 515 (class 1255 OID 221217)
-- Name: dml_forum_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_forum_update_modified(id_user_ numeric, _id_forum numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) RETURNS TABLE(id_forum numeric, id_course numeric, title_forum character varying, description_forum character varying, date_forum timestamp with time zone, deleted_forum boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_UPDATE_FORUM BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_FORUM = (select * from business.dml_forum_update(id_user_, _id_forum, _id_course, _title_forum, _description_forum, _date_forum, _deleted_forum));

			 	IF (_UPDATE_FORUM) THEN
					RETURN QUERY select bvf.id_forum, bvf.id_course, bvf.title_forum, bvf.description_forum, bvf.date_forum, bvf.deleted_forum, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course from business.view_forum bvf
						inner join business.view_course bvc on bvf.id_course = bvc.id_course
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
			 
$$;


ALTER FUNCTION business.dml_forum_update_modified(id_user_ numeric, _id_forum numeric, _id_course numeric, _title_forum character varying, _description_forum character varying, _date_forum timestamp with time zone, _deleted_forum boolean) OWNER TO postgres;

--
-- TOC entry 468 (class 1255 OID 221121)
-- Name: dml_glossary_create(numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_create(id_user_ numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_glossary')-1);
				_COUNT = (select count(*) from business.view_glossary t where t.id_glossary = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_glossary t where t.id_glossary = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.glossary(id_glossary, id_course, term_glossary, concept_glossary, date_glossary, deleted_glossary) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_glossary LOOP
							_RETURNIG = _X.id_glossary;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'glossary',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_glossary '||_id_glossary||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_glossary'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_glossary_create(id_user_ numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) OWNER TO postgres;

--
-- TOC entry 520 (class 1255 OID 221229)
-- Name: dml_glossary_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_create_modified(id_user_ numeric, _id_course numeric) RETURNS TABLE(id_glossary numeric, id_course numeric, term_glossary character varying, concept_glossary character varying, date_glossary timestamp with time zone, deleted_glossary boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_glossary_create_modified(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 470 (class 1255 OID 221123)
-- Name: dml_glossary_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_delete(id_user_ numeric, _id_glossary numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_glossary t where t.id_glossary = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_glossary t where t.id_glossary = $2 and deleted_glossary = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','glossary', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.glossary SET deleted_glossary=true WHERE id_glossary = $2 RETURNING id_glossary LOOP
								_RETURNIG = _X.id_glossary;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'glossary',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_glossary_delete(id_user_ numeric, _id_glossary numeric) OWNER TO postgres;

--
-- TOC entry 519 (class 1255 OID 221227)
-- Name: dml_glossary_delete_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_delete_modified(id_user_ numeric, _id_glossary numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
			 DECLARE
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	-- Obtener los ids de los registros que se eliminaran
				-- select * from dev.utils_get_columns_type('business', '')
				
				-- Eliminar registros en cascada
				
				-- Retornar true
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 $$;


ALTER FUNCTION business.dml_glossary_delete_modified(id_user_ numeric, _id_glossary numeric) OWNER TO postgres;

--
-- TOC entry 469 (class 1255 OID 221122)
-- Name: dml_glossary_update(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_update(id_user_ numeric, _id_glossary numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_glossary t where t.id_glossary = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_glossary t where t.id_glossary = $2 and deleted_glossary = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_glossary t where t.id_glossary = _id_glossary and t.id_glossary != _id_glossary);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.glossary SET id_course=$3, term_glossary=$4, concept_glossary=$5, date_glossary=$6, deleted_glossary=$7 WHERE id_glossary=$2 RETURNING id_glossary LOOP
								_RETURNIG = _X.id_glossary;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'glossary',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_glossary '||_id_glossary||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_glossary_update(id_user_ numeric, _id_glossary numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) OWNER TO postgres;

--
-- TOC entry 521 (class 1255 OID 221230)
-- Name: dml_glossary_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_glossary_update_modified(id_user_ numeric, _id_glossary numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) RETURNS TABLE(id_glossary numeric, id_course numeric, term_glossary character varying, concept_glossary character varying, date_glossary timestamp with time zone, deleted_glossary boolean, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_glossary_update_modified(id_user_ numeric, _id_glossary numeric, _id_course numeric, _term_glossary character varying, _concept_glossary character varying, _date_glossary timestamp with time zone, _deleted_glossary boolean) OWNER TO postgres;

--
-- TOC entry 450 (class 1255 OID 221103)
-- Name: dml_newsletter_create(numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_newsletter_create(id_user_ numeric, _id_company numeric, _id_user numeric, _name_newsletter character varying, _description_newsletter character varying, _date_newsletter timestamp with time zone, _deleted boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_newsletter')-1);
				_COUNT = (select count(*) from business.view_newsletter t where t.id_newsletter = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO business.newsletter(id_newsletter, id_company, id_user, name_newsletter, description_newsletter, date_newsletter, deleted) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_newsletter LOOP
						_RETURNIG = _X.id_newsletter;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'newsletter',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_newsletter'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_newsletter_create(id_user_ numeric, _id_company numeric, _id_user numeric, _name_newsletter character varying, _description_newsletter character varying, _date_newsletter timestamp with time zone, _deleted boolean) OWNER TO postgres;

--
-- TOC entry 452 (class 1255 OID 221105)
-- Name: dml_newsletter_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_newsletter_delete(id_user_ numeric, _id_newsletter numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_newsletter t where t.id_newsletter = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','newsletter', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM business.newsletter WHERE id_newsletter = $2 RETURNING id_newsletter LOOP
							_RETURNIG = _X.id_newsletter;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'newsletter',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_newsletter_delete(id_user_ numeric, _id_newsletter numeric) OWNER TO postgres;

--
-- TOC entry 451 (class 1255 OID 221104)
-- Name: dml_newsletter_update(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_newsletter_update(id_user_ numeric, _id_newsletter numeric, _id_company numeric, _id_user numeric, _name_newsletter character varying, _description_newsletter character varying, _date_newsletter timestamp with time zone, _deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from business.view_newsletter t where t.id_newsletter = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE business.newsletter SET id_company=$3, id_user=$4, name_newsletter=$5, description_newsletter=$6, date_newsletter=$7, deleted=$8 WHERE id_newsletter=$2 RETURNING id_newsletter LOOP
						_RETURNIG = _X.id_newsletter;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'newsletter',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_newsletter_update(id_user_ numeric, _id_newsletter numeric, _id_company numeric, _id_user numeric, _name_newsletter character varying, _description_newsletter character varying, _date_newsletter timestamp with time zone, _deleted boolean) OWNER TO postgres;

--
-- TOC entry 477 (class 1255 OID 221130)
-- Name: dml_partial_create(numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_partial_create(id_user_ numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- quimester
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_quimester v where v.id_quimester = _id_quimester);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_quimester||' de la tabla quimester no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_partial')-1);
				_COUNT = (select count(*) from business.view_partial t where t.id_partial = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_partial t where t.id_partial = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.partial(id_partial, id_quimester, name_partial, description_partial, deleted_partial) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 ) RETURNING id_partial LOOP
							_RETURNIG = _X.id_partial;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'partial',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_partial '||_id_partial||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_partial'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_partial_create(id_user_ numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) OWNER TO postgres;

--
-- TOC entry 511 (class 1255 OID 221213)
-- Name: dml_partial_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_partial_create_modified(id_user_ numeric, _id_quimester numeric) RETURNS TABLE(id_partial numeric, id_quimester numeric, name_partial character varying, description_partial character varying, deleted_partial boolean, id_period numeric, name_quimester character varying, description_quimester character varying)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_partial_create_modified(id_user_ numeric, _id_quimester numeric) OWNER TO postgres;

--
-- TOC entry 479 (class 1255 OID 221132)
-- Name: dml_partial_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_partial_delete(id_user_ numeric, _id_partial numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_partial t where t.id_partial = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_partial t where t.id_partial = $2 and deleted_partial = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','partial', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.partial SET deleted_partial=true WHERE id_partial = $2 RETURNING id_partial LOOP
								_RETURNIG = _X.id_partial;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'partial',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_partial_delete(id_user_ numeric, _id_partial numeric) OWNER TO postgres;

--
-- TOC entry 478 (class 1255 OID 221131)
-- Name: dml_partial_update(numeric, numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_partial_update(id_user_ numeric, _id_partial numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- quimester
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_quimester v where v.id_quimester = _id_quimester);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_quimester||' de la tabla quimester no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_partial t where t.id_partial = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_partial t where t.id_partial = $2 and deleted_partial = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_partial t where t.id_partial = _id_partial and t.id_partial != _id_partial);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.partial SET id_quimester=$3, name_partial=$4, description_partial=$5, deleted_partial=$6 WHERE id_partial=$2 RETURNING id_partial LOOP
								_RETURNIG = _X.id_partial;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'partial',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_partial '||_id_partial||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_partial_update(id_user_ numeric, _id_partial numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) OWNER TO postgres;

--
-- TOC entry 512 (class 1255 OID 221214)
-- Name: dml_partial_update_modified(numeric, numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_partial_update_modified(id_user_ numeric, _id_partial numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) RETURNS TABLE(id_partial numeric, id_quimester numeric, name_partial character varying, description_partial character varying, deleted_partial boolean, id_period numeric, name_quimester character varying, description_quimester character varying)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_partial_update_modified(id_user_ numeric, _id_partial numeric, _id_quimester numeric, _name_partial character varying, _description_partial character varying, _deleted_partial boolean) OWNER TO postgres;

--
-- TOC entry 440 (class 1255 OID 221091)
-- Name: dml_period_create(numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_period_create(id_user_ numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_period')-1);
				_COUNT = (select count(*) from business.view_period t where t.id_period = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_period t where t.name_period = _name_period);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.period(id_period, id_company, name_period, description_period, start_date_period, end_date_period, maximum_rating, approval_note_period, deleted_period) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 ) RETURNING id_period LOOP
							_RETURNIG = _X.id_period;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'period',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_period '||_name_period||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_period'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_period_create(id_user_ numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) OWNER TO postgres;

--
-- TOC entry 488 (class 1255 OID 221190)
-- Name: dml_period_create_modified(numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_period_create_modified(id_user_ numeric) RETURNS TABLE(id_period numeric, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, deleted_period boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_period_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 442 (class 1255 OID 221093)
-- Name: dml_period_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_period_delete(id_user_ numeric, _id_period numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_period t where t.id_period = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_period t where t.id_period = $2 and deleted_period = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','period', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.period SET deleted_period=true WHERE id_period = $2 RETURNING id_period LOOP
								_RETURNIG = _X.id_period;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'period',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_period_delete(id_user_ numeric, _id_period numeric) OWNER TO postgres;

--
-- TOC entry 441 (class 1255 OID 221092)
-- Name: dml_period_update(numeric, numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_period_update(id_user_ numeric, _id_period numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_period t where t.id_period = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_period t where t.id_period = $2 and deleted_period = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_period t where t.name_period = _name_period and t.id_period != _id_period);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.period SET id_company=$3, name_period=$4, description_period=$5, start_date_period=$6, end_date_period=$7, maximum_rating=$8, approval_note_period=$9, deleted_period=$10 WHERE id_period=$2 RETURNING id_period LOOP
								_RETURNIG = _X.id_period;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'period',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el name_period '||_name_period||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_period_update(id_user_ numeric, _id_period numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) OWNER TO postgres;

--
-- TOC entry 489 (class 1255 OID 221191)
-- Name: dml_period_update_modified(numeric, numeric, numeric, character varying, character varying, timestamp without time zone, timestamp without time zone, numeric, numeric, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_period_update_modified(id_user_ numeric, _id_period numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) RETURNS TABLE(id_period numeric, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, deleted_period boolean, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_period_update_modified(id_user_ numeric, _id_period numeric, _id_company numeric, _name_period character varying, _description_period character varying, _start_date_period timestamp without time zone, _end_date_period timestamp without time zone, _maximum_rating numeric, _approval_note_period numeric, _deleted_period boolean) OWNER TO postgres;

--
-- TOC entry 459 (class 1255 OID 221112)
-- Name: dml_quimester_create(numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_quimester_create(id_user_ numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- period
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_period v where v.id_period = _id_period);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_period||' de la tabla period no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_quimester')-1);
				_COUNT = (select count(*) from business.view_quimester t where t.id_quimester = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_quimester t where t.id_quimester = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.quimester(id_quimester, id_period, name_quimester, description_quimester, deleted_quimester) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 ) RETURNING id_quimester LOOP
							_RETURNIG = _X.id_quimester;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'quimester',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_quimester '||_id_quimester||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_quimester'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_quimester_create(id_user_ numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) OWNER TO postgres;

--
-- TOC entry 509 (class 1255 OID 221211)
-- Name: dml_quimester_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_quimester_create_modified(id_user_ numeric, _id_period numeric) RETURNS TABLE(id_quimester numeric, id_period numeric, name_quimester character varying, description_quimester character varying, deleted_quimester boolean, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_quimester_create_modified(id_user_ numeric, _id_period numeric) OWNER TO postgres;

--
-- TOC entry 461 (class 1255 OID 221114)
-- Name: dml_quimester_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_quimester_delete(id_user_ numeric, _id_quimester numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_quimester t where t.id_quimester = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_quimester t where t.id_quimester = $2 and deleted_quimester = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','quimester', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.quimester SET deleted_quimester=true WHERE id_quimester = $2 RETURNING id_quimester LOOP
								_RETURNIG = _X.id_quimester;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'quimester',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_quimester_delete(id_user_ numeric, _id_quimester numeric) OWNER TO postgres;

--
-- TOC entry 460 (class 1255 OID 221113)
-- Name: dml_quimester_update(numeric, numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_quimester_update(id_user_ numeric, _id_quimester numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- period
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_period v where v.id_period = _id_period);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_period||' de la tabla period no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_quimester t where t.id_quimester = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_quimester t where t.id_quimester = $2 and deleted_quimester = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_quimester t where t.id_quimester = _id_quimester and t.id_quimester != _id_quimester);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.quimester SET id_period=$3, name_quimester=$4, description_quimester=$5, deleted_quimester=$6 WHERE id_quimester=$2 RETURNING id_quimester LOOP
								_RETURNIG = _X.id_quimester;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'quimester',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_quimester '||_id_quimester||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_quimester_update(id_user_ numeric, _id_quimester numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) OWNER TO postgres;

--
-- TOC entry 510 (class 1255 OID 221212)
-- Name: dml_quimester_update_modified(numeric, numeric, numeric, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_quimester_update_modified(id_user_ numeric, _id_quimester numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) RETURNS TABLE(id_quimester numeric, id_period numeric, name_quimester character varying, description_quimester character varying, deleted_quimester boolean, id_company numeric, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_quimester_update_modified(id_user_ numeric, _id_quimester numeric, _id_period numeric, _name_quimester character varying, _description_quimester character varying, _deleted_quimester boolean) OWNER TO postgres;

--
-- TOC entry 462 (class 1255 OID 221115)
-- Name: dml_resource_course_create(numeric, numeric, numeric, character varying, character varying, character varying, character varying, timestamp with time zone); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_course_create(id_user_ numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp with time zone) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_resource_course')-1);
				_COUNT = (select count(*) from business.view_resource_course t where t.id_resource_course = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO business.resource_course(id_resource_course, id_course, id_user, file_name, length_mb, extension, server_path, upload_date) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 ) RETURNING id_resource_course LOOP
						_RETURNIG = _X.id_resource_course;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'resource_course',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_resource_course'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_resource_course_create(id_user_ numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp with time zone) OWNER TO postgres;

--
-- TOC entry 513 (class 1255 OID 221215)
-- Name: dml_resource_course_create_modified(numeric, numeric, numeric, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_course_create_modified(id_user_ numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying) RETURNS TABLE(id_resource_course numeric, id_course numeric, id_user numeric, file_name character varying, length_mb character varying, extension character varying, server_path character varying, upload_date timestamp with time zone, id_company numeric, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_resource_course_create_modified(id_user_ numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying) OWNER TO postgres;

--
-- TOC entry 464 (class 1255 OID 221117)
-- Name: dml_resource_course_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_course_delete(id_user_ numeric, _id_resource_course numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_resource_course t where t.id_resource_course = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','resource_course', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM business.resource_course WHERE id_resource_course = $2 RETURNING id_resource_course LOOP
							_RETURNIG = _X.id_resource_course;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'resource_course',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_resource_course_delete(id_user_ numeric, _id_resource_course numeric) OWNER TO postgres;

--
-- TOC entry 463 (class 1255 OID 221116)
-- Name: dml_resource_course_update(numeric, numeric, numeric, numeric, character varying, character varying, character varying, character varying, timestamp with time zone); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_course_update(id_user_ numeric, _id_resource_course numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp with time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from business.view_resource_course t where t.id_resource_course = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE business.resource_course SET id_course=$3, id_user=$4, file_name=$5, length_mb=$6, extension=$7, server_path=$8, upload_date=$9 WHERE id_resource_course=$2 RETURNING id_resource_course LOOP
						_RETURNIG = _X.id_resource_course;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'resource_course',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_resource_course_update(id_user_ numeric, _id_resource_course numeric, _id_course numeric, _id_user numeric, _file_name character varying, _length_mb character varying, _extension character varying, _server_path character varying, _upload_date timestamp with time zone) OWNER TO postgres;

--
-- TOC entry 471 (class 1255 OID 221124)
-- Name: dml_resource_create(numeric, numeric, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_create(id_user_ numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_task v where v.id_task = _id_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_task||' de la tabla task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_resource')-1);
				_COUNT = (select count(*) from business.view_resource t where t.id_resource = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_resource t where t.id_resource = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.resource(id_resource, id_task, name_resource, description_resource, link_resource, deleted_resource) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_resource LOOP
							_RETURNIG = _X.id_resource;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'resource',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_resource '||_id_resource||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_resource'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_resource_create(id_user_ numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) OWNER TO postgres;

--
-- TOC entry 500 (class 1255 OID 221202)
-- Name: dml_resource_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_create_modified(id_user_ numeric, _id_task numeric) RETURNS TABLE(id_resource numeric, id_task numeric, name_resource character varying, description_resource character varying, link_resource character varying, deleted_resource boolean, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_resource_create_modified(id_user_ numeric, _id_task numeric) OWNER TO postgres;

--
-- TOC entry 473 (class 1255 OID 221126)
-- Name: dml_resource_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_delete(id_user_ numeric, _id_resource numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_resource t where t.id_resource = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_resource t where t.id_resource = $2 and deleted_resource = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','resource', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.resource SET deleted_resource=true WHERE id_resource = $2 RETURNING id_resource LOOP
								_RETURNIG = _X.id_resource;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'resource',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_resource_delete(id_user_ numeric, _id_resource numeric) OWNER TO postgres;

--
-- TOC entry 472 (class 1255 OID 221125)
-- Name: dml_resource_update(numeric, numeric, numeric, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_update(id_user_ numeric, _id_resource numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_task v where v.id_task = _id_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_task||' de la tabla task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_resource t where t.id_resource = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_resource t where t.id_resource = $2 and deleted_resource = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_resource t where t.id_resource = _id_resource and t.id_resource != _id_resource);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.resource SET id_task=$3, name_resource=$4, description_resource=$5, link_resource=$6, deleted_resource=$7 WHERE id_resource=$2 RETURNING id_resource LOOP
								_RETURNIG = _X.id_resource;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'resource',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_resource '||_id_resource||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_resource_update(id_user_ numeric, _id_resource numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) OWNER TO postgres;

--
-- TOC entry 501 (class 1255 OID 221203)
-- Name: dml_resource_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_resource_update_modified(id_user_ numeric, _id_resource numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) RETURNS TABLE(id_resource numeric, id_task numeric, name_resource character varying, description_resource character varying, link_resource character varying, deleted_resource boolean, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_resource_update_modified(id_user_ numeric, _id_resource numeric, _id_task numeric, _name_resource character varying, _description_resource character varying, _link_resource character varying, _deleted_resource boolean) OWNER TO postgres;

--
-- TOC entry 436 (class 1255 OID 221088)
-- Name: dml_schedule_create(numeric, time without time zone, time without time zone, numeric, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_schedule_create(id_user_ numeric, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone, _deleted_schedule boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_CURRENT_ID = (select nextval('business.serial_schedule')-1);
				_COUNT = (select count(*) from business.view_schedule t where t.id_schedule = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_schedule t where t.id_schedule = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.schedule(id_schedule, start_date_schedule, end_date_schedule, tolerance_schedule, creation_date_schedule, deleted_schedule) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_schedule LOOP
							_RETURNIG = _X.id_schedule;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'schedule',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_schedule '||_id_schedule||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_schedule'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_schedule_create(id_user_ numeric, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone, _deleted_schedule boolean) OWNER TO postgres;

--
-- TOC entry 438 (class 1255 OID 221090)
-- Name: dml_schedule_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_schedule_delete(id_user_ numeric, _id_schedule numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_schedule t where t.id_schedule = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_schedule t where t.id_schedule = $2 and deleted_schedule = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','schedule', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.schedule SET deleted_schedule=true WHERE id_schedule = $2 RETURNING id_schedule LOOP
								_RETURNIG = _X.id_schedule;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'schedule',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_schedule_delete(id_user_ numeric, _id_schedule numeric) OWNER TO postgres;

--
-- TOC entry 437 (class 1255 OID 221089)
-- Name: dml_schedule_update(numeric, numeric, time without time zone, time without time zone, numeric, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_schedule_update(id_user_ numeric, _id_schedule numeric, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone, _deleted_schedule boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_COUNT = (select count(*) from business.view_schedule t where t.id_schedule = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_schedule t where t.id_schedule = $2 and deleted_schedule = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_schedule t where t.id_schedule = _id_schedule and t.id_schedule != _id_schedule);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.schedule SET start_date_schedule=$3, end_date_schedule=$4, tolerance_schedule=$5, creation_date_schedule=$6, deleted_schedule=$7 WHERE id_schedule=$2 RETURNING id_schedule LOOP
								_RETURNIG = _X.id_schedule;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'schedule',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_schedule '||_id_schedule||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_schedule_update(id_user_ numeric, _id_schedule numeric, _start_date_schedule time without time zone, _end_date_schedule time without time zone, _tolerance_schedule numeric, _creation_date_schedule timestamp without time zone, _deleted_schedule boolean) OWNER TO postgres;

--
-- TOC entry 453 (class 1255 OID 221106)
-- Name: dml_task_create(numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_create(id_user_ numeric, _id_course numeric, _id_user numeric, _id_partial numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- partial
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_partial v where v.id_partial = _id_partial);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_partial||' de la tabla partial no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_task')-1);
				_COUNT = (select count(*) from business.view_task t where t.id_task = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from business.view_task t where t.name_task = _name_task);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO business.task(id_task, id_course, id_user, id_partial, name_task, description_task, status_task, creation_date_task, limit_date, deleted_task) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10 ) RETURNING id_task LOOP
							_RETURNIG = _X.id_task;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'task',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_task '||_name_task||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_task'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_task_create(id_user_ numeric, _id_course numeric, _id_user numeric, _id_partial numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) OWNER TO postgres;

--
-- TOC entry 497 (class 1255 OID 221199)
-- Name: dml_task_create_modified(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_create_modified(id_user_ numeric, _id_course numeric) RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_TASK NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN				
				_ID_TASK = (select * from business.dml_task_create(id_user_, _id_course, id_user_, 'Nueva tarea', '', false, now()::timestamp, (select * from core.utils_get_date_maximum_hour()), false));

				IF (_ID_TASK >= 1) THEN
					RETURN QUERY select bvt.id_task, bvt.id_course, bvt.id_user, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_task bvt
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
			
$$;


ALTER FUNCTION business.dml_task_create_modified(id_user_ numeric, _id_course numeric) OWNER TO postgres;

--
-- TOC entry 455 (class 1255 OID 221108)
-- Name: dml_task_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_delete(id_user_ numeric, _id_task numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_task t where t.id_task = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_task t where t.id_task = $2 and deleted_task = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','task', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE business.task SET deleted_task=true WHERE id_task = $2 RETURNING id_task LOOP
								_RETURNIG = _X.id_task;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'task',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_task_delete(id_user_ numeric, _id_task numeric) OWNER TO postgres;

--
-- TOC entry 499 (class 1255 OID 221201)
-- Name: dml_task_send(numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_send(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_task_send(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) OWNER TO postgres;

--
-- TOC entry 454 (class 1255 OID 221107)
-- Name: dml_task_update(numeric, numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_update(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _id_partial numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- course
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_course v where v.id_course = _id_course);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_course||' de la tabla course no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- partial
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_partial v where v.id_partial = _id_partial);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_partial||' de la tabla partial no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from business.view_task t where t.id_task = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from business.view_task t where t.id_task = $2 and deleted_task = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from business.view_task t where t.name_task = _name_task and t.id_task != _id_task);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE business.task SET id_course=$3, id_user=$4, id_partial=$5, name_task=$6, description_task=$7, status_task=$8, creation_date_task=$9, limit_date=$10, deleted_task=$11 WHERE id_task=$2 RETURNING id_task LOOP
								_RETURNIG = _X.id_task;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'task',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el name_task '||_name_task||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_task_update(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _id_partial numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) OWNER TO postgres;

--
-- TOC entry 498 (class 1255 OID 221200)
-- Name: dml_task_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, boolean, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_task_update_modified(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) RETURNS TABLE(id_task numeric, id_course numeric, id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, deleted_task boolean, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, name_period character varying, description_period character varying, start_date_period timestamp without time zone, end_date_period timestamp without time zone, maximum_rating numeric, approval_note_period numeric, name_career character varying, description_career character varying, status_career boolean, creation_date_career timestamp without time zone, start_date_schedule time without time zone, end_date_schedule time without time zone, tolerance_schedule numeric, creation_date_schedule timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_UPDATE_TASK BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_TASK = (select * from business.dml_task_update(id_user_, _id_task, _id_course, _id_user, _name_task, _description_task, _status_task, _creation_date_task, _limit_date, _deleted_task));

			 	IF (_UPDATE_TASK) THEN
					RETURN QUERY select bvt.id_task, bvt.id_course, bvt.id_user, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule from business.view_task bvt
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
			 
$$;


ALTER FUNCTION business.dml_task_update_modified(id_user_ numeric, _id_task numeric, _id_course numeric, _id_user numeric, _name_task character varying, _description_task character varying, _status_task boolean, _creation_date_task timestamp without time zone, _limit_date timestamp without time zone, _deleted_task boolean) OWNER TO postgres;

--
-- TOC entry 474 (class 1255 OID 221127)
-- Name: dml_user_task_create(numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_user_task_create(id_user_ numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_task v where v.id_task = _id_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_task||' de la tabla task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('business.serial_user_task')-1);
				_COUNT = (select count(*) from business.view_user_task t where t.id_user_task = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO business.user_task(id_user_task, id_user, id_task, response_user_task, shipping_date_user_task, qualification_user_task, is_open, is_dispatched, is_qualified) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 ) RETURNING id_user_task LOOP
						_RETURNIG = _X.id_user_task;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'user_task',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''business.serial_user_task'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION business.dml_user_task_create(id_user_ numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) OWNER TO postgres;

--
-- TOC entry 502 (class 1255 OID 221204)
-- Name: dml_user_task_create_modified(numeric, numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_user_task_create_modified(id_user_ numeric, _id_user numeric, _id_task numeric) RETURNS TABLE(id_user_task numeric, bvut_id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, cvt_id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, maximum_rating numeric)
    LANGUAGE plpgsql
    AS $$
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
			
$$;


ALTER FUNCTION business.dml_user_task_create_modified(id_user_ numeric, _id_user numeric, _id_task numeric) OWNER TO postgres;

--
-- TOC entry 476 (class 1255 OID 221129)
-- Name: dml_user_task_delete(numeric, numeric); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_user_task_delete(id_user_ numeric, _id_user_task numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from business.view_user_task t where t.id_user_task = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('business','user_task', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM business.user_task WHERE id_user_task = $2 RETURNING id_user_task LOOP
							_RETURNIG = _X.id_user_task;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'user_task',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_user_task_delete(id_user_ numeric, _id_user_task numeric) OWNER TO postgres;

--
-- TOC entry 475 (class 1255 OID 221128)
-- Name: dml_user_task_update(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_user_task_update(id_user_ numeric, _id_user_task numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- task
			_COUNT_EXTERNALS_IDS = (select count(*) from business.view_task v where v.id_task = _id_task);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_task||' de la tabla task no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from business.view_user_task t where t.id_user_task = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE business.user_task SET id_user=$3, id_task=$4, response_user_task=$5, shipping_date_user_task=$6, qualification_user_task=$7, is_open=$8, is_dispatched=$9, is_qualified=$10 WHERE id_user_task=$2 RETURNING id_user_task LOOP
						_RETURNIG = _X.id_user_task;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'user_task',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION business.dml_user_task_update(id_user_ numeric, _id_user_task numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) OWNER TO postgres;

--
-- TOC entry 503 (class 1255 OID 221205)
-- Name: dml_user_task_update_modified(numeric, numeric, numeric, numeric, character varying, timestamp without time zone, numeric, boolean, boolean, boolean); Type: FUNCTION; Schema: business; Owner: postgres
--

CREATE FUNCTION business.dml_user_task_update_modified(id_user_ numeric, _id_user_task numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) RETURNS TABLE(id_user_task numeric, bvut_id_user numeric, id_task numeric, response_user_task character varying, shipping_date_user_task timestamp without time zone, qualification_user_task numeric, is_open boolean, is_dispatched boolean, is_qualified boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, id_course numeric, cvt_id_user numeric, name_task character varying, description_task character varying, status_task boolean, creation_date_task timestamp without time zone, limit_date timestamp without time zone, id_period numeric, id_career numeric, id_schedule numeric, name_course character varying, description_course character varying, status_course boolean, creation_date_course timestamp without time zone, maximum_rating numeric)
    LANGUAGE plpgsql
    AS $$
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
			 
$$;


ALTER FUNCTION business.dml_user_task_update_modified(id_user_ numeric, _id_user_task numeric, _id_user numeric, _id_task numeric, _response_user_task character varying, _shipping_date_user_task timestamp without time zone, _qualification_user_task numeric, _is_open boolean, _is_dispatched boolean, _is_qualified boolean) OWNER TO postgres;

--
-- TOC entry 377 (class 1255 OID 220757)
-- Name: auth_check_session(numeric, json); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.auth_check_session(_id_session numeric, _agent_session json) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_STATUS_SESSION BOOLEAN;
	_HOST CHARACTER VARYING;
	_BROWSER CHARACTER VARYING;
	_VERSION CHARACTER VARYING;
	_OS CHARACTER VARYING;
	_PLATFORM CHARACTER VARYING;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	_STATUS_SESSION = (select vs.status_session from core.view_session vs where vs.id_session = _id_session);
	
	_HOST = (select vs.host_session from core.view_session vs where vs.id_session = _id_session);
	_BROWSER = (select (select vs.agent_session from core.view_session vs where vs.id_session = _id_session)->>'browser');
	_VERSION = (select (select vs.agent_session from core.view_session vs where vs.id_session = _id_session)->>'version');
	_OS = (select (select vs.agent_session from core.view_session vs where vs.id_session = _id_session)->>'os');
	_PLATFORM = (select (select vs.agent_session from core.view_session vs where vs.id_session = _id_session)->>'platform');
	
	IF (_STATUS_SESSION) THEN
		IF (_HOST = _agent_session->>'host') THEN
			IF (_BROWSER = _agent_session->'agent'->>'browser') THEN
				IF (_VERSION = _agent_session->'agent'->>'version') THEN
					IF (_OS = _agent_session->'agent'->>'os') THEN
						IF (_PLATFORM = _agent_session->'agent'->>'platform') THEN
							RETURN true;
						ELSE
							_EXCEPTION = 'EL platform del agent es incorrecto';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
						END IF;
					ELSE
						_EXCEPTION = 'El SO del agent es incorrecto';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
					END IF;
				ELSE
					_EXCEPTION = 'La version del agent es incorrecto';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
				END IF;
			ELSE
				_EXCEPTION = 'El browser del agent es incorrecto';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
			END IF;
		ELSE
			_EXCEPTION = 'El host de la sesión es incorrecto';
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
		END IF;
	ELSE
		_EXCEPTION = 'La sesión se encuentra cerrada';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
END;
-- select * from core.auth_check_session(11, '{"host":"172.18.2.3:3000","agent":{"browser":"Chrome","version":"98.0.4758.102","os":"Windows 10.0","platform":"Microsoft Windows","source":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"}}')
$$;


ALTER FUNCTION core.auth_check_session(_id_session numeric, _agent_session json) OWNER TO postgres;

--
-- TOC entry 374 (class 1255 OID 220754)
-- Name: auth_check_user(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.auth_check_user(_name_user character varying) RETURNS TABLE(status_check_user boolean, _expiration_verification_code numeric)
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_COUNT_NAME_USER NUMERIC;
	_COUNT_PASSWORD_USER NUMERIC;
	_STATUS_USER BOOLEAN;
	_STATUS_COMPANY BOOLEAN;
	_STATUS_PROFILE BOOLEAN;
	_ID_COMPANY NUMERIC;
	_EXPIRATION_VERIFICATION_CODE NUMERIC;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	-- Verificar que el usuario este registrado
	_COUNT_NAME_USER = (select count(*) from core.view_user vu where vu.name_user = _name_user);
	IF (_COUNT_NAME_USER >= 0) THEN
		-- Verificar el estado del usuario 
		_STATUS_USER = (select vu.status_user from core.view_user vu where vu.name_user = _name_user);
		IF (_STATUS_USER) THEN
			-- Verificar el estado de la empresa del usuario				
			_STATUS_COMPANY = (select vc.status_company from core.view_company vc inner join core.view_user vu on vc.id_company = vu.id_company where vu.name_user = _name_user); 
			IF (_STATUS_COMPANY) THEN
				-- Verificar el estado del perfil				
				_STATUS_PROFILE = (select vp.status_profile from core.view_profile vp inner join core.view_user vu on vp.id_profile = vu.id_profile where vu.name_user = _name_user); 
				IF (_STATUS_PROFILE) THEN
					-- Obtener el id de la empresa
					_ID_COMPANY = (select vc.id_company from core.view_company vc inner join core.view_user vu on vc.id_company = vu.id_company where vu.name_user = _name_user);
					-- Obtener la configuración
					_EXPIRATION_VERIFICATION_CODE = (select vs.expiration_verification_code from core.view_setting vs inner join core.view_company vc on vc.id_setting = vs.id_setting where vc.id_company = _ID_COMPANY);
					-- Return query
					RETURN QUERY select true as status_check_user, _EXPIRATION_VERIFICATION_CODE as _expiration_verification_code;
				ELSE
					_EXCEPTION = 'El perfil del usuario '||$1||' se encuentra desactivado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
				END IF;
			ELSE
				_EXCEPTION = 'La empresa del usuario '||$1||' se encuentra desactivada';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
			END IF;
		ELSE
			_EXCEPTION = 'El usuario '||$1||' se encuentra desactivado';
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
		END IF;
	ELSE
		_EXCEPTION = 'El usuario '||$1||' no se encuentra registrado';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
END;
-- select * from core.auth_check_user('tsantsa.edu@gmail.com')
$_$;


ALTER FUNCTION core.auth_check_user(_name_user character varying) OWNER TO postgres;

--
-- TOC entry 375 (class 1255 OID 220755)
-- Name: auth_reset_password(character varying, character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.auth_reset_password(_name_user character varying, _new_password character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_COUNT_NAME_USER NUMERIC;
	_COUNT_PASSWORD_USER NUMERIC;
	_STATUS_USER BOOLEAN;
	_STATUS_COMPANY BOOLEAN;
	_STATUS_PROFILE BOOLEAN;
	_STATUS_RESET_PASSWORD BOOLEAN;
	_X RECORD;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	-- Verificar que el usuario este registrado
	_COUNT_NAME_USER = (select count(*) from core.view_user vu where vu.name_user = _name_user);
	IF (_COUNT_NAME_USER >= 0) THEN
		-- Verificar el estado del usuario 
		_STATUS_USER = (select vu.status_user from core.view_user vu where vu.name_user = _name_user);
		IF (_STATUS_USER) THEN
			-- Verificar el estado de la empresa del usuario				
			_STATUS_COMPANY = (select vc.status_company from core.view_company vc inner join core.view_user vu on vc.id_company = vu.id_company where vu.name_user = _name_user); 
			IF (_STATUS_COMPANY) THEN
				-- Verificar el estado del perfil				
				_STATUS_PROFILE = (select vp.status_profile from core.view_profile vp inner join core.view_user vu on vp.id_profile = vu.id_profile where vu.name_user = _name_user); 
				IF (_STATUS_PROFILE) THEN
					FOR _X IN UPDATE core.user u SET password_user = _new_password WHERE u.name_user = _name_user returning true as status_reset_password LOOP
						_STATUS_RESET_PASSWORD = _X.status_reset_password;
					END LOOP;
					IF (_STATUS_RESET_PASSWORD) THEN
						RETURN _STATUS_RESET_PASSWORD;
					ELSE
						_EXCEPTION = 'Ocurrió un error al restablecer la contraseña del usuario '||$1||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
					END IF;
				ELSE
					_EXCEPTION = 'El perfil del usuario '||$1||' se encuentra desactivado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
				END IF;
			ELSE
				_EXCEPTION = 'La empresa del usuario '||$1||' se encuentra desactivada';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
			END IF;
		ELSE
			_EXCEPTION = 'El usuario '||$1||' se encuentra desactivado';
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
		END IF;
	ELSE
		_EXCEPTION = 'El usuario '||$1||' no se encuentra registrado';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
END;
-- select * from core.auth_reset_password('tsantsa.edu@gmail.com', 'nuevacontraseña')
$_$;


ALTER FUNCTION core.auth_reset_password(_name_user character varying, _new_password character varying) OWNER TO postgres;

--
-- TOC entry 373 (class 1255 OID 220752)
-- Name: auth_sign_in(character varying, character varying, character varying, json); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.auth_sign_in(_name_user character varying, _password_user character varying, _host_session character varying, _agent_session json) RETURNS TABLE(status_sign_in boolean, id_session numeric, id_user numeric, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, avatar_user character varying, status_user boolean, id_setting numeric, name_company character varying, status_company boolean, expiration_token numeric, inactivity_time numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, navigation json)
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_SESSION_LIMIT NUMERIC;
	_SESSION_COUNT NUMERIC;
	_COUNT_NAME_USER NUMERIC;
	_COUNT_PASSWORD_USER NUMERIC;
	_STATUS_USER BOOLEAN;
	_STATUS_COMPANY BOOLEAN;
	_STATUS_PROFILE BOOLEAN;
	_COUNT_NAVIGATION NUMERIC;
	_ID_USER NUMERIC;
	_ID_SESSION NUMERIC;
	_X RECORD;
	_NAVIGATION TEXT DEFAULT '';
	_NAV JSON;
	_EXCEPTION TEXT DEFAULT '';
BEGIN
	-- Verificar que el usuario no exceda las sesiones segun la configuración de la empresa
	_SESSION_LIMIT = (select vs.session_limit from core.view_user vu inner join core.view_company vc on vu.id_company = vc.id_company inner join core.view_setting vs on vc.id_setting = vs.id_setting where vu.name_user = _name_user);
	_SESSION_COUNT = (select count(*) from core.view_session vs inner join core.view_user vu on vs.id_user = vu.id_user where vu.name_user = 'tsantsa.edu@gmail.com' and vs.status_session = true);
	
	IF (_SESSION_COUNT >= _SESSION_LIMIT) THEN
		_EXCEPTION = 'Ha excedido el máximo de sesiones activas por usuario';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
	-- Verificar que el usuario este registrado
	_COUNT_NAME_USER = (select count(*) from core.view_user vu where vu.name_user = _name_user);
	IF (_COUNT_NAME_USER >= 1) THEN
		-- Verificar la contraseña del usuario
		_COUNT_PASSWORD_USER = (select count(*) from core.view_user vu where vu.name_user = _name_user and vu.password_user = _password_user);
		IF (_COUNT_PASSWORD_USER >= 1) THEN
			-- Verificar el estado del usuario 
			_STATUS_USER = (select vu.status_user from core.view_user vu where vu.name_user = _name_user);
			IF (_STATUS_USER) THEN
				-- Verificar el estado de la empresa del usuario				
				_STATUS_COMPANY = (select vc.status_company from core.view_company vc inner join core.view_user vu on vc.id_company = vu.id_company where vu.name_user = _name_user); 
				IF (_STATUS_COMPANY) THEN
					-- Verificar el estado del perfil				
					_STATUS_PROFILE = (select vp.status_profile from core.view_profile vp inner join core.view_user vu on vp.id_profile = vu.id_profile where vu.name_user = _name_user); 
					IF (_STATUS_PROFILE) THEN
						_COUNT_NAVIGATION = (select count(*) from core.view_navigation vn
							inner join core.view_profile_navigation vpn on vn.id_navigation = vpn.id_navigation
							inner join core.view_profile vp on vp.id_profile = vpn.id_profile
							inner join core.view_user vu on vu.id_profile = vp.id_profile
							where vu.name_user = _name_user and vn.status_navigation = true);
						
						IF (_COUNT_NAVIGATION >= 1) THEN
							-- OBTENER LA NAVEGACION DEL USUARIO LOGEADO DE ACUERDO A SU PERFIL DE USUARIO
							FOR _X IN select vn.* from core.view_navigation vn inner join core.view_profile_navigation vpn on vn.id_navigation = vpn.id_navigation inner join core.view_profile vp on vp.id_profile = vpn.id_profile inner join core.view_user vu on vu.id_profile = vp.id_profile where vu.name_user = _name_user and vn.status_navigation = true LOOP
								_NAVIGATION = _NAVIGATION || '"'||_X.type_navigation||'": '||_X.content_navigation||',';
							END LOOP;
							-- ELIMINAR ULTIMA ,
							-- RAISE NOTICE '%', _NAVIGATION;
							_NAVIGATION = (select substring(_NAVIGATION from 1 for (char_length(_NAVIGATION)-1)));
							-- TRANSFORMAR STRING TO JSON[]
							_NAV = '{'||_NAVIGATION||'}';
							-- RAISE NOTICE '%', _NAV; 
							-- RAISE NOTICE '%', _NAV->0; 
							-- RAISE NOTICE '%', _NAV->1; 
							
							_ID_USER = (select vu.id_user from core.view_user vu where vu.name_user = _name_user);
							_ID_SESSION = (select * from core.dml_session_create(_ID_USER, _ID_USER, _host_session, _agent_session, now()::timestamp, now()::timestamp, true));
							
							RETURN QUERY select true as status_sign_in, _ID_SESSION as id_sesion, vu.id_user, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.avatar_user, vu.status_user, vc.id_setting, vc.name_company, vc.status_company, vs.expiration_token, vs.inactivity_time, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile, _NAV from core.view_user vu
								inner join core.view_company vc on vu.id_company = vc.id_company
								inner join core.view_setting vs on vc.id_setting = vs.id_setting
								inner join core.view_person vp on vu.id_person = vp.id_person
								inner join core.view_profile vpr on vu.id_profile = vpr.id_profile
								where vu.name_user = _name_user;
						ELSE
							_EXCEPTION = 'El usuario '||$1||' no tiene navegaciones activas en su perfil';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
						END IF;
					ELSE
						_EXCEPTION = 'El perfil del usuario '||$1||' se encuentra desactivado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
					END IF;
				ELSE
					_EXCEPTION = 'La empresa del usuario '||$1||' se encuentra desactivada';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
				END IF;
			ELSE
				_EXCEPTION = 'El usuario '||$1||' se encuentra desactivado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
			END IF;
		ELSE
			_EXCEPTION = 'La contraseña ingresada es incorrecta';
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
		END IF;
	ELSE
		_EXCEPTION = 'El usuario '||$1||' no se encuentra registrado';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
END;
	-- select * from  core.auth_sign_in('tsantsa.edu@gmail.com', 'uOuuMWQb8Ll7Kj9QkunbTg==')
	-- select * from core.security_cap_aes_decrypt('uOuuMWQb8Ll7Kj9QkunbTg==')
$_$;


ALTER FUNCTION core.auth_sign_in(_name_user character varying, _password_user character varying, _host_session character varying, _agent_session json) OWNER TO postgres;

--
-- TOC entry 376 (class 1255 OID 220756)
-- Name: auth_sign_out(character varying, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.auth_sign_out(_name_user character varying, _id_session numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_ID_USER NUMERIC;
	_RELEASE_SESSION boolean;
	_RESPONSE BOOLEAN;
	_SAVE_LOG BOOLEAN DEFAULT false;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	_ID_USER = (select vu.id_user from core.view_user vu where vu.name_user = _name_user);
	_RELEASE_SESSION = (select * from core.dml_session_release(_id_session));
	
	IF (_RELEASE_SESSION) THEN
		_SAVE_LOG = (select * from core.global_save_log());
		IF (_SAVE_LOG) THEN
			_RESPONSE = (core.dml_system_event_create(_ID_USER,'session',_id_session,'singOut', now()::timestamp, false));
			IF (_RESPONSE != true) THEN
				_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
			END IF;
		END IF;
		RETURN true;
	ELSE
		_EXCEPTION = 'Ocurrió un error al cerrar la sessión';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
END;
$$;


ALTER FUNCTION core.auth_sign_out(_name_user character varying, _id_session numeric) OWNER TO postgres;

--
-- TOC entry 382 (class 1255 OID 220839)
-- Name: dml_academic_create(numeric, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_academic_create(id_user_ numeric, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _deleted_academic boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_CURRENT_ID = (select nextval('core.serial_academic')-1);
				_COUNT = (select count(*) from core.view_academic t where t.id_academic = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_academic t where t.id_academic = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.academic(id_academic, title_academic, abbreviation_academic, nivel_academic, deleted_academic) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 ) RETURNING id_academic LOOP
							_RETURNIG = _X.id_academic;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'academic',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_academic '||_id_academic||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_academic'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_academic_create(id_user_ numeric, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _deleted_academic boolean) OWNER TO postgres;

--
-- TOC entry 384 (class 1255 OID 220841)
-- Name: dml_academic_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_academic_delete(id_user_ numeric, _id_academic numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_academic t where t.id_academic = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_academic t where t.id_academic = $2 and deleted_academic = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','academic', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.academic SET deleted_academic=true WHERE id_academic = $2 RETURNING id_academic LOOP
								_RETURNIG = _X.id_academic;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'academic',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_academic_delete(id_user_ numeric, _id_academic numeric) OWNER TO postgres;

--
-- TOC entry 383 (class 1255 OID 220840)
-- Name: dml_academic_update(numeric, numeric, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_academic_update(id_user_ numeric, _id_academic numeric, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _deleted_academic boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_COUNT = (select count(*) from core.view_academic t where t.id_academic = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_academic t where t.id_academic = $2 and deleted_academic = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_academic t where t.id_academic = _id_academic and t.id_academic != _id_academic);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.academic SET title_academic=$3, abbreviation_academic=$4, nivel_academic=$5, deleted_academic=$6 WHERE id_academic=$2 RETURNING id_academic LOOP
								_RETURNIG = _X.id_academic;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'academic',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_academic '||_id_academic||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_academic_update(id_user_ numeric, _id_academic numeric, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _deleted_academic boolean) OWNER TO postgres;

--
-- TOC entry 399 (class 1255 OID 220857)
-- Name: dml_company_create(numeric, numeric, character varying, character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_create(id_user_ numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- setting
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_setting v where v.id_setting = _id_setting);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_setting||' de la tabla setting no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_company')-1);
				_COUNT = (select count(*) from core.view_company t where t.id_company = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_company t where t.name_company = _name_company);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.company(id_company, id_setting, name_company, acronym_company, address_company, status_company, deleted_company) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_company LOOP
							_RETURNIG = _X.id_company;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'company',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_company '||_name_company||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_company'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_company_create(id_user_ numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean) OWNER TO postgres;

--
-- TOC entry 408 (class 1255 OID 220953)
-- Name: dml_company_create_modified(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_create_modified(id_user_ numeric) RETURNS TABLE(id_company numeric, id_setting numeric, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, deleted_company boolean, expiration_token numeric, expiration_verification_code numeric, inactivity_time numeric, session_limit numeric)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_SETTING NUMERIC;
				_ID_COMPANY NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_SETTING = (select * from core.dml_setting_create(id_user_, 300, 300, 300, false));
				
				IF (_ID_SETTING >= 1) THEN
					_ID_COMPANY = (select * from core.dml_company_create(id_user_, _ID_SETTING, 'Nueva empresa', false, false) );
					
					IF (_ID_COMPANY >= 1) THEN
						RETURN QUERY select vc.id_company, vc.id_setting, vc.name_company, vc.acronym_company, vc.address_company, vc.status_company, vc.deleted_company, vs.expiration_token, vs.expiration_verification_code, vs.inactivity_time, vs.session_limit from core.view_company vc
							inner join core.view_setting vs on vc.id_setting = vs.id_setting where vc.id_company = _ID_COMPANY;
					ELSE
						_EXCEPTION = 'Ocurrió un error al ingresar una nueva institución';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la configuración';
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
			
$$;


ALTER FUNCTION core.dml_company_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 401 (class 1255 OID 220859)
-- Name: dml_company_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_delete(id_user_ numeric, _id_company numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_company t where t.id_company = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_company t where t.id_company = $2 and deleted_company = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','company', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.company SET deleted_company=true WHERE id_company = $2 RETURNING id_company LOOP
								_RETURNIG = _X.id_company;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'company',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_company_delete(id_user_ numeric, _id_company numeric) OWNER TO postgres;

--
-- TOC entry 410 (class 1255 OID 220955)
-- Name: dml_company_delete_modified(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_delete_modified(id_user_ numeric, _id_company numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_ID_SETTING NUMERIC;
			 	_DELETE_SETTING BOOLEAN;
			 	_DELETE_COMPANY BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_ID_SETTING = (select vs.id_setting from core.view_company vc inner join core.view_setting vs on vc.id_setting = vs.id_setting where vc.id_company = _id_company);
			 
			 	IF (_ID_SETTING >= 1) THEN
			 		_DELETE_COMPANY = (select * from core.dml_company_delete(id_user_, _id_company));
					
					IF (_DELETE_COMPANY) THEN
			 			_DELETE_SETTING = (select * from core.dml_setting_delete(id_user_, _id_setting));
						
						IF (_DELETE_SETTING) THEN
							return true;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar la configuración';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al eliminar la institución';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 	ELSE
					_EXCEPTION = 'No se encontró la configuración';
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
			 
$$;


ALTER FUNCTION core.dml_company_delete_modified(id_user_ numeric, _id_company numeric) OWNER TO postgres;

--
-- TOC entry 400 (class 1255 OID 220858)
-- Name: dml_company_update(numeric, numeric, numeric, character varying, character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_update(id_user_ numeric, _id_company numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- setting
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_setting v where v.id_setting = _id_setting);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_setting||' de la tabla setting no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_company t where t.id_company = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_company t where t.id_company = $2 and deleted_company = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_company t where t.name_company = _name_company and t.id_company != _id_company);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.company SET id_setting=$3, name_company=$4, acronym_company=$5, address_company=$6, status_company=$7, deleted_company=$8 WHERE id_company=$2 RETURNING id_company LOOP
								_RETURNIG = _X.id_company;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'company',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el name_company '||_name_company||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_company_update(id_user_ numeric, _id_company numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean) OWNER TO postgres;

--
-- TOC entry 409 (class 1255 OID 220954)
-- Name: dml_company_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean, boolean, numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_company_update_modified(id_user_ numeric, _id_company numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric) RETURNS TABLE(id_company numeric, id_setting numeric, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, deleted_company boolean, expiration_token numeric, expiration_verification_code numeric, inactivity_time numeric, session_limit numeric)
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_UPDATE_SETTING BOOLEAN;
			 	_UPDATE_COMPANY BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_SETTING = (select * from core.dml_setting_update(id_user_, _id_setting, _expiration_token, _expiration_verification_code, _inactivity_time, _session_limit, false));

			 	IF (_UPDATE_SETTING) THEN
			 		_UPDATE_COMPANY = (select * from core.dml_company_update(id_user_, _id_company, _id_setting, _name_company, _acronym_company, _address_company, _status_company, _deleted_company));
				
					IF (_UPDATE_COMPANY) THEN
						RETURN QUERY select vc.id_company, vc.id_setting, vc.name_company, vc.acronym_company, vc.address_company, vc.status_company, vc.deleted_company, vs.expiration_token, vs.expiration_verification_code, vs.inactivity_time, vs.session_limit from core.view_company vc
							inner join core.view_setting vs on vc.id_setting = vs.id_setting where vc.id_company = _id_company;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar la institución';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la configuración';
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
			 
$$;


ALTER FUNCTION core.dml_company_update_modified(id_user_ numeric, _id_company numeric, _id_setting numeric, _name_company character varying, _acronym_company character varying, _address_company character varying, _status_company boolean, _deleted_company boolean, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric) OWNER TO postgres;

--
-- TOC entry 385 (class 1255 OID 220842)
-- Name: dml_job_create(numeric, character varying, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_job_create(id_user_ numeric, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying, _deleted_job boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_CURRENT_ID = (select nextval('core.serial_job')-1);
				_COUNT = (select count(*) from core.view_job t where t.id_job = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_job t where t.id_job = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.job(id_job, name_job, address_job, phone_job, position_job, deleted_job) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_job LOOP
							_RETURNIG = _X.id_job;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'job',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_job '||_id_job||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_job'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_job_create(id_user_ numeric, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying, _deleted_job boolean) OWNER TO postgres;

--
-- TOC entry 371 (class 1255 OID 220844)
-- Name: dml_job_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_job_delete(id_user_ numeric, _id_job numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_job t where t.id_job = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_job t where t.id_job = $2 and deleted_job = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','job', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.job SET deleted_job=true WHERE id_job = $2 RETURNING id_job LOOP
								_RETURNIG = _X.id_job;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'job',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_job_delete(id_user_ numeric, _id_job numeric) OWNER TO postgres;

--
-- TOC entry 386 (class 1255 OID 220843)
-- Name: dml_job_update(numeric, numeric, character varying, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_job_update(id_user_ numeric, _id_job numeric, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying, _deleted_job boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_COUNT = (select count(*) from core.view_job t where t.id_job = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_job t where t.id_job = $2 and deleted_job = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_job t where t.id_job = _id_job and t.id_job != _id_job);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.job SET name_job=$3, address_job=$4, phone_job=$5, position_job=$6, deleted_job=$7 WHERE id_job=$2 RETURNING id_job LOOP
								_RETURNIG = _X.id_job;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'job',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_job '||_id_job||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_job_update(id_user_ numeric, _id_job numeric, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying, _deleted_job boolean) OWNER TO postgres;

--
-- TOC entry 413 (class 1255 OID 220860)
-- Name: dml_navigation_create(numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_navigation_create(id_user_ numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_navigation')-1);
				_COUNT = (select count(*) from core.view_navigation t where t.id_navigation = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_navigation t where t.name_navigation = _name_navigation and t.id_company = _id_company);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.navigation(id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 ) RETURNING id_navigation LOOP
							_RETURNIG = _X.id_navigation;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'navigation',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el name_navigation '||_name_navigation||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_navigation'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$_$;


ALTER FUNCTION core.dml_navigation_create(id_user_ numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) OWNER TO postgres;

--
-- TOC entry 414 (class 1255 OID 220958)
-- Name: dml_navigation_create_modified(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_navigation_create_modified(id_user_ numeric) RETURNS TABLE(id_navigation numeric, id_company numeric, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json, deleted_navigation boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_NAVIGATION NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
				
				_ID_NAVIGATION = (select * from core.dml_navigation_create(id_user_, _ID_COMPANY, 'Nueva navegación', '', 'defaultNavigation', false, '[]', false));
				
				IF (_ID_NAVIGATION >= 1) THEN
					RETURN QUERY select * from core.view_navigation vn where vn.id_navigation = _ID_NAVIGATION;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la navegación';
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
			
$$;


ALTER FUNCTION core.dml_navigation_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 402 (class 1255 OID 220862)
-- Name: dml_navigation_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_navigation_delete(id_user_ numeric, _id_navigation numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_navigation t where t.id_navigation = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_navigation t where t.id_navigation = $2 and deleted_navigation = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','navigation', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.navigation SET deleted_navigation=true WHERE id_navigation = $2 RETURNING id_navigation LOOP
								_RETURNIG = _X.id_navigation;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'navigation',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_navigation_delete(id_user_ numeric, _id_navigation numeric) OWNER TO postgres;

--
-- TOC entry 415 (class 1255 OID 220861)
-- Name: dml_navigation_update(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_navigation_update(id_user_ numeric, _id_navigation numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_navigation t where t.id_navigation = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_navigation t where t.id_navigation = $2 and deleted_navigation = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_navigation t where t.name_navigation = _name_navigation and t.id_navigation != _id_navigation and t.id_navigation = _id_navigation);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.navigation SET id_company=$3, name_navigation=$4, description_navigation=$5, type_navigation=$6, status_navigation=$7, content_navigation=$8, deleted_navigation=$9 WHERE id_navigation=$2 RETURNING id_navigation LOOP
								_RETURNIG = _X.id_navigation;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'navigation',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el nombre de navegación '||_name_navigation||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 
$_$;


ALTER FUNCTION core.dml_navigation_update(id_user_ numeric, _id_navigation numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) OWNER TO postgres;

--
-- TOC entry 416 (class 1255 OID 220959)
-- Name: dml_navigation_update_modified(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_navigation_update_modified(id_user_ numeric, _id_navigation numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) RETURNS TABLE(id_navigation numeric, id_company numeric, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json, deleted_navigation boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_UPDATE_NAVIGATION BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_UPDATE_NAVIGATION = (select * from core.dml_navigation_update(id_user_, _id_navigation, _id_company, _name_navigation, _description_navigation, _type_navigation, _status_navigation, _content_navigation, _deleted_navigation));
				
				IF (_UPDATE_NAVIGATION) THEN
					RETURN QUERY select * from core.view_navigation vn where vn.id_navigation = _id_navigation;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la navegación';
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
			
$$;


ALTER FUNCTION core.dml_navigation_update_modified(id_user_ numeric, _id_navigation numeric, _id_company numeric, _name_navigation character varying, _description_navigation character varying, _type_navigation core."TYPE_NAVIGATION", _status_navigation boolean, _content_navigation json, _deleted_navigation boolean) OWNER TO postgres;

--
-- TOC entry 387 (class 1255 OID 220845)
-- Name: dml_person_create(numeric, numeric, numeric, character varying, character varying, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_person_create(id_user_ numeric, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _deleted_person boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- academic
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_academic v where v.id_academic = _id_academic);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_academic||' de la tabla academic no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- job
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_job v where v.id_job = _id_job);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_job||' de la tabla job no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_person')-1);
				_COUNT = (select count(*) from core.view_person t where t.id_person = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_person t where t.dni_person = _dni_person);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.person(id_person, id_academic, id_job, dni_person, name_person, last_name_person, address_person, phone_person, deleted_person) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 ) RETURNING id_person LOOP
							_RETURNIG = _X.id_person;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'person',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el dni_person '||_dni_person||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_person'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_person_create(id_user_ numeric, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _deleted_person boolean) OWNER TO postgres;

--
-- TOC entry 389 (class 1255 OID 220847)
-- Name: dml_person_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_person_delete(id_user_ numeric, _id_person numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_person t where t.id_person = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_person t where t.id_person = $2 and deleted_person = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','person', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.person SET deleted_person=true WHERE id_person = $2 RETURNING id_person LOOP
								_RETURNIG = _X.id_person;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'person',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_person_delete(id_user_ numeric, _id_person numeric) OWNER TO postgres;

--
-- TOC entry 388 (class 1255 OID 220846)
-- Name: dml_person_update(numeric, numeric, numeric, numeric, character varying, character varying, character varying, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_person_update(id_user_ numeric, _id_person numeric, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _deleted_person boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- academic
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_academic v where v.id_academic = _id_academic);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_academic||' de la tabla academic no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- job
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_job v where v.id_job = _id_job);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_job||' de la tabla job no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_person t where t.id_person = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_person t where t.id_person = $2 and deleted_person = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_person t where t.dni_person = _dni_person and t.id_person != _id_person);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.person SET id_academic=$3, id_job=$4, dni_person=$5, name_person=$6, last_name_person=$7, address_person=$8, phone_person=$9, deleted_person=$10 WHERE id_person=$2 RETURNING id_person LOOP
								_RETURNIG = _X.id_person;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'person',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el dni_person '||_dni_person||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_person_update(id_user_ numeric, _id_person numeric, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _deleted_person boolean) OWNER TO postgres;

--
-- TOC entry 417 (class 1255 OID 220863)
-- Name: dml_profile_create(numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_create(id_user_ numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_profile')-1);
				_COUNT = (select count(*) from core.view_profile t where t.id_profile = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_profile t where t.name_profile = _name_profile and t.id_company =_id_company);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.profile(id_profile, id_company, type_profile, name_profile, description_profile, status_profile, deleted_profile) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_profile LOOP
							_RETURNIG = _X.id_profile;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'profile',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el nombre de perfil '||_name_profile||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_profile'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$_$;


ALTER FUNCTION core.dml_profile_create(id_user_ numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) OWNER TO postgres;

--
-- TOC entry 418 (class 1255 OID 220960)
-- Name: dml_profile_create_modified(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_create_modified(id_user_ numeric) RETURNS TABLE(id_profile numeric, id_company numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, deleted_profile boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_PROFILE NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
				
				_ID_PROFILE = (select * from core.dml_profile_create(id_user_, _ID_COMPANY, 'commonProfile', 'Nuevo perfil', '', false, false));
				IF (_ID_PROFILE >= 1) THEN
					RETURN QUERY select * from core.view_profile vp where vp.id_profile = _ID_PROFILE;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar el perfil';
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
			
$$;


ALTER FUNCTION core.dml_profile_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 403 (class 1255 OID 220865)
-- Name: dml_profile_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_delete(id_user_ numeric, _id_profile numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_profile t where t.id_profile = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_profile t where t.id_profile = $2 and deleted_profile = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','profile', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.profile SET deleted_profile=true WHERE id_profile = $2 RETURNING id_profile LOOP
								_RETURNIG = _X.id_profile;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'profile',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_profile_delete(id_user_ numeric, _id_profile numeric) OWNER TO postgres;

--
-- TOC entry 421 (class 1255 OID 220962)
-- Name: dml_profile_delete_modified(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_delete_modified(id_user_ numeric, _id_profile numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
			 DECLARE
				_X RECORD;
				_DELETE_NAVIGATION BOOLEAN;
				_DELETE_PROFILE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				FOR _X IN select * from core.view_profile_navigation cvpn where cvpn.id_profile = _id_profile LOOP
					_DELETE_NAVIGATION = (select * from core.dml_profile_navigation_delete(id_user_, _X.id_profile_navigation));
				END LOOP;
				
				_DELETE_PROFILE = (select * from core.dml_profile_delete(id_user_, _id_profile));
				IF (_DELETE_PROFILE) THEN
					RETURN true;
				ELSE
					_EXCEPTION = 'Ocurrió un error al eliminar el perfil';
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
			 
$$;


ALTER FUNCTION core.dml_profile_delete_modified(id_user_ numeric, _id_profile numeric) OWNER TO postgres;

--
-- TOC entry 390 (class 1255 OID 220848)
-- Name: dml_profile_navigation_create(numeric, numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_navigation_create(id_user_ numeric, _id_profile numeric, _id_navigation numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- profile
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_profile v where v.id_profile = _id_profile);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_profile||' de la tabla profile no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- navigation
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_navigation v where v.id_navigation = _id_navigation);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_navigation||' de la tabla navigation no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_profile_navigation')-1);
				_COUNT = (select count(*) from core.view_profile_navigation t where t.id_profile_navigation = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID, $2 , $3 ) RETURNING id_profile_navigation LOOP
						_RETURNIG = _X.id_profile_navigation;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'profile_navigation',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_profile_navigation'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_profile_navigation_create(id_user_ numeric, _id_profile numeric, _id_navigation numeric) OWNER TO postgres;

--
-- TOC entry 422 (class 1255 OID 220963)
-- Name: dml_profile_navigation_create_modified(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_navigation_create_modified(id_user_ numeric, _id_profile numeric) RETURNS TABLE(id_profile_navigation numeric, id_profile numeric, id_navigation numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMPANY numeric;
				_ID_NAVIGATION numeric;
				_ID_PROFILE_NAVIGATION NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				-- Get the id company _ID_COMPANY
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_); 
				
				_ID_NAVIGATION = (select navigations.id_navigation from (select vn.id_navigation from core.view_navigation vn where vn.id_company = _ID_COMPANY) as navigations 
					LEFT JOIN (select distinct vpn.id_navigation from core.view_profile_navigation vpn inner join core.view_navigation vn on vpn.id_navigation = vn.id_navigation where vpn.id_profile = _id_profile and vn.id_company = _ID_COMPANY) as navigationsAssigned 
					on navigations.id_navigation = navigationsAssigned.id_navigation where navigationsAssigned.id_navigation IS NULL order by navigations.id_navigation asc limit 1);

				IF (_ID_NAVIGATION >= 1) THEN
					_ID_PROFILE_NAVIGATION = (select * from core.dml_profile_navigation_create(id_user_, _id_profile, _ID_NAVIGATION));
					
					IF (_ID_PROFILE_NAVIGATION >= 1) THEN
						RETURN QUERY select vpn.id_profile_navigation, vpn.id_profile, vpn.id_navigation, vp.type_profile, vp.name_profile, vp.description_profile, vp.status_profile, vn.name_navigation, vn.description_navigation, vn.type_navigation, vn.status_navigation, vn.content_navigation from core.view_profile_navigation vpn
							inner join core.view_profile vp on vpn.id_profile = vp.id_profile
							inner join core.view_navigation vn on vpn.id_navigation = vn.id_navigation where vpn.id_profile_navigation = _ID_PROFILE_NAVIGATION;
					ELSE
						_EXCEPTION = 'Ocurrió un error al ingresar la navegación al perfil';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'No se encontraron navegaciones registradas';
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
			
$$;


ALTER FUNCTION core.dml_profile_navigation_create_modified(id_user_ numeric, _id_profile numeric) OWNER TO postgres;

--
-- TOC entry 392 (class 1255 OID 220850)
-- Name: dml_profile_navigation_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_navigation_delete(id_user_ numeric, _id_profile_navigation numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_profile_navigation t where t.id_profile_navigation = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','profile_navigation', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM core.profile_navigation WHERE id_profile_navigation = $2 RETURNING id_profile_navigation LOOP
							_RETURNIG = _X.id_profile_navigation;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'profile_navigation',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_profile_navigation_delete(id_user_ numeric, _id_profile_navigation numeric) OWNER TO postgres;

--
-- TOC entry 391 (class 1255 OID 220849)
-- Name: dml_profile_navigation_update(numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_navigation_update(id_user_ numeric, _id_profile_navigation numeric, _id_profile numeric, _id_navigation numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- profile
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_profile v where v.id_profile = _id_profile);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_profile||' de la tabla profile no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- navigation
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_navigation v where v.id_navigation = _id_navigation);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_navigation||' de la tabla navigation no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from core.view_profile_navigation t where t.id_profile_navigation = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE core.profile_navigation SET id_profile=$3, id_navigation=$4 WHERE id_profile_navigation=$2 RETURNING id_profile_navigation LOOP
						_RETURNIG = _X.id_profile_navigation;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'profile_navigation',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_profile_navigation_update(id_user_ numeric, _id_profile_navigation numeric, _id_profile numeric, _id_navigation numeric) OWNER TO postgres;

--
-- TOC entry 424 (class 1255 OID 220964)
-- Name: dml_profile_navigation_update_modified(numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_navigation_update_modified(id_user_ numeric, _id_profile_navigation numeric, _id_profile numeric, _id_navigation numeric) RETURNS TABLE(id_profile_navigation numeric, id_profile numeric, id_navigation numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_UPDATE_PROFILE_NAVIGATION BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_UPDATE_PROFILE_NAVIGATION = (select * from core.dml_profile_navigation_update(id_user_, _id_profile_navigation, _id_profile, _id_navigation));
				
				IF (_UPDATE_PROFILE_NAVIGATION) THEN
					RETURN QUERY select vpn.id_profile_navigation, vpn.id_profile, vpn.id_navigation, vp.type_profile, vp.name_profile, vp.description_profile, vp.status_profile, vn.name_navigation, vn.description_navigation, vn.type_navigation, vn.status_navigation, vn.content_navigation from core.view_profile_navigation vpn
							inner join core.view_profile vp on vpn.id_profile = vp.id_profile
							inner join core.view_navigation vn on vpn.id_navigation = vn.id_navigation where vpn.id_profile_navigation = _id_profile_navigation;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la navegación';
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
			
$$;


ALTER FUNCTION core.dml_profile_navigation_update_modified(id_user_ numeric, _id_profile_navigation numeric, _id_profile numeric, _id_navigation numeric) OWNER TO postgres;

--
-- TOC entry 419 (class 1255 OID 220864)
-- Name: dml_profile_update(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_update(id_user_ numeric, _id_profile numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_profile t where t.id_profile = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_profile t where t.id_profile = $2 and deleted_profile = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_profile t where t.name_profile = _name_profile and t.id_profile != _id_profile and t.id_company = _id_company);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.profile SET id_company=$3, type_profile=$4, name_profile=$5, description_profile=$6, status_profile=$7, deleted_profile=$8 WHERE id_profile=$2 RETURNING id_profile LOOP
								_RETURNIG = _X.id_profile;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'profile',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el nombre de perfil '||_name_profile||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 
$_$;


ALTER FUNCTION core.dml_profile_update(id_user_ numeric, _id_profile numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) OWNER TO postgres;

--
-- TOC entry 420 (class 1255 OID 220961)
-- Name: dml_profile_update_modified(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_profile_update_modified(id_user_ numeric, _id_profile numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) RETURNS TABLE(id_profile numeric, id_company numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, deleted_profile boolean)
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_UPDATE_PROFILE BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_PROFILE = (select * from core.dml_profile_update(id_user_, _id_profile, _id_company, _type_profile, _name_profile, _description_profile, _status_profile, _deleted_profile));

			 	IF (_UPDATE_PROFILE) THEN
					RETURN QUERY select * from core.view_profile vp where vp.id_profile = _id_profile;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar el perfil';
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
			 
$$;


ALTER FUNCTION core.dml_profile_update_modified(id_user_ numeric, _id_profile numeric, _id_company numeric, _type_profile core."TYPE_PROFILE", _name_profile character varying, _description_profile character varying, _status_profile boolean, _deleted_profile boolean) OWNER TO postgres;

--
-- TOC entry 435 (class 1255 OID 220971)
-- Name: dml_session_by_company_release_all(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_by_company_release_all(id_user_ numeric, _id_company numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
			 	_COUNT_SESSION NUMERIC;
				_RELEASE_SESSION boolean;
				_RESPONSE BOOLEAN;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT_SESSION = (select count(*) from core.view_session vs inner join core.view_user vu on vs.id_user = vu.id_user where vu.id_company = _id_company and vs.status_session = true);
				
				IF (_COUNT_SESSION = 0) THEN
					_EXCEPTION = 'La empresa '||_id_company||' no tiene sessiones activas';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				
				-- Sessions of company
				FOR _X IN select vs.id_session from core.view_session vs inner join core.view_user vu on vs.id_user = vu.id_user where vu.id_company = _id_company and vs.status_session = true LOOP
					_RELEASE_SESSION = (select * from core.dml_session_release(_X.id_session));
				END LOOP;
				
				IF (_RELEASE_SESSION) THEN
					_SAVE_LOG = (select * from core.global_save_log());
					IF (_SAVE_LOG) THEN
						_RESPONSE = (core.dml_system_event_create($1,'session',$2,'byCompanyReleaseAll', now()::timestamp, false));
						IF (_RESPONSE != true) THEN
							_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
					RETURN true;
				ELSE
					_EXCEPTION = 'Ocurrió un error al liberar las sessiones de la institución '||_id_company||'';
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
			 
$_$;


ALTER FUNCTION core.dml_session_by_company_release_all(id_user_ numeric, _id_company numeric) OWNER TO postgres;

--
-- TOC entry 433 (class 1255 OID 220969)
-- Name: dml_session_by_session_release(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_by_session_release(id_user_ numeric, _id_session numeric) RETURNS TABLE(id_session_ numeric, id_user numeric, host_session character varying, agent_session json, date_sign_in_session timestamp without time zone, date_sign_out_session timestamp without time zone, status_session boolean, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_setting numeric, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean)
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RELEASE_SESSION boolean;
				_RESPONSE BOOLEAN;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
				_RELEASE_SESSION = (select * from core.dml_session_release(_id_session));
				
				IF (_RELEASE_SESSION) THEN
					_SAVE_LOG = (select * from core.global_save_log());
					IF (_SAVE_LOG) THEN
						_RESPONSE = (core.dml_system_event_create($1,'session',$2,'bySessionRelease', now()::timestamp, false));
						IF (_RESPONSE != true) THEN
							_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
					RETURN query select vs.id_session as id_session_, vs.id_user, vs.host_session, vs.agent_session, vs.date_sign_in_session, vs.date_sign_out_session, vs.status_session, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vc.id_setting, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile from core.view_session vs
						inner join core.view_user vu on vs.id_user = vu.id_user
						inner join core.view_company vc on vu.id_company = vc.id_company
						inner join core.view_person vp on vu.id_person = vp.id_person
						inner join core.view_profile vpr on vu.id_profile = vpr.id_profile where vs.id_session = _id_session;
				ELSE
					_EXCEPTION = 'Ocurrió un error al liberar la sessión';
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
			 
$_$;


ALTER FUNCTION core.dml_session_by_session_release(id_user_ numeric, _id_session numeric) OWNER TO postgres;

--
-- TOC entry 434 (class 1255 OID 220970)
-- Name: dml_session_by_user_release_all(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_by_user_release_all(id_user_ numeric, _id_user numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
			 	_COUNT_SESSION NUMERIC;
				_RELEASE_SESSION boolean;
				_RESPONSE BOOLEAN;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT_SESSION = (select count(*) from core.view_session vs where vs.id_user = _id_user and vs.status_session = true);
				
				IF (_COUNT_SESSION = 0) THEN
					_EXCEPTION = 'El usuario '||_id_user||' no tiene sessiones activas';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				
				FOR _X IN select vs.id_session from core.view_session vs where vs.id_user = _id_user and vs.status_session = true LOOP
					_RELEASE_SESSION = (select * from core.dml_session_release(_X.id_session));
				END LOOP;
				
				IF (_RELEASE_SESSION) THEN
					_SAVE_LOG = (select * from core.global_save_log());
					IF (_SAVE_LOG) THEN
						_RESPONSE = (core.dml_system_event_create($1,'session',$2,'byUserReleaseAll', now()::timestamp, false));
						IF (_RESPONSE != true) THEN
							_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
					RETURN true;
				ELSE
					_EXCEPTION = 'Ocurrió un error al liberar las sessiones del usuario '||_id_user||'';
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
			 
$_$;


ALTER FUNCTION core.dml_session_by_user_release_all(id_user_ numeric, _id_user numeric) OWNER TO postgres;

--
-- TOC entry 431 (class 1255 OID 220870)
-- Name: dml_session_create(numeric, numeric, character varying, json, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_create(id_user_ numeric, _id_user numeric, _host_session character varying, _agent_session json, _date_sign_in_session timestamp without time zone, _date_sign_out_session timestamp without time zone, _status_session boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_session')-1);
				_COUNT = (select count(*) from core.view_session t where t.id_session = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO core.session(id_session, id_user, host_session, agent_session, date_sign_in_session, status_session) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $7 ) RETURNING id_session LOOP
						_RETURNIG = _X.id_session;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'session',_CURRENT_ID,'CREATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_session'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$_$;


ALTER FUNCTION core.dml_session_create(id_user_ numeric, _id_user numeric, _host_session character varying, _agent_session json, _date_sign_in_session timestamp without time zone, _date_sign_out_session timestamp without time zone, _status_session boolean) OWNER TO postgres;

--
-- TOC entry 404 (class 1255 OID 220872)
-- Name: dml_session_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_delete(id_user_ numeric, _id_session numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_session t where t.id_session = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','session', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE
						FOR _X IN DELETE FROM core.session WHERE id_session = $2 RETURNING id_session LOOP
							_RETURNIG = _X.id_session;
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'session',$2,'DELETE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_session_delete(id_user_ numeric, _id_session numeric) OWNER TO postgres;

--
-- TOC entry 432 (class 1255 OID 220968)
-- Name: dml_session_release(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_release(_id_session numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_COUNT NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			 	_COUNT = (select count(*) from core.view_session t where t.id_session = $1);
				
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE core.session SET date_sign_out_session = now()::timestamp, status_session = false WHERE id_session = $1 RETURNING id_session LOOP
						_RETURNIG = _X.id_session;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						RETURN true;
					ELSE
						RETURN false;
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 
$_$;


ALTER FUNCTION core.dml_session_release(_id_session numeric) OWNER TO postgres;

--
-- TOC entry 407 (class 1255 OID 220871)
-- Name: dml_session_update(numeric, numeric, numeric, character varying, json, timestamp without time zone, timestamp without time zone, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_session_update(id_user_ numeric, _id_session numeric, _id_user numeric, _host_session character varying, _agent_session json, _date_sign_in_session timestamp without time zone, _date_sign_out_session timestamp without time zone, _status_session boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- user
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_user v where v.id_user = _id_user);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_user||' de la tabla user no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
			 	_COUNT = (select count(*) from core.view_session t where t.id_session = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE core.session SET id_user=$3, host_session=$4, agent_session=$5, date_sign_in_session=$6, date_sign_out_session=$7, status_session=$8 WHERE id_session=$2 RETURNING id_session LOOP
						_RETURNIG = _X.id_session;
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'session',$2,'UPDATE', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_session_update(id_user_ numeric, _id_session numeric, _id_user numeric, _host_session character varying, _agent_session json, _date_sign_in_session timestamp without time zone, _date_sign_out_session timestamp without time zone, _status_session boolean) OWNER TO postgres;

--
-- TOC entry 393 (class 1255 OID 220851)
-- Name: dml_setting_create(numeric, numeric, numeric, numeric, numeric, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_setting_create(id_user_ numeric, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric, _deleted_setting boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_CURRENT_ID = (select nextval('core.serial_setting')-1);
				_COUNT = (select count(*) from core.view_setting t where t.id_setting = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_setting t where t.id_setting = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.setting(id_setting, expiration_token, expiration_verification_code, inactivity_time, session_limit, deleted_setting) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 ) RETURNING id_setting LOOP
							_RETURNIG = _X.id_setting;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'setting',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_setting '||_id_setting||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_setting'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_setting_create(id_user_ numeric, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric, _deleted_setting boolean) OWNER TO postgres;

--
-- TOC entry 395 (class 1255 OID 220853)
-- Name: dml_setting_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_setting_delete(id_user_ numeric, _id_setting numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_setting t where t.id_setting = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_setting t where t.id_setting = $2 and deleted_setting = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','setting', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.setting SET deleted_setting=true WHERE id_setting = $2 RETURNING id_setting LOOP
								_RETURNIG = _X.id_setting;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'setting',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_setting_delete(id_user_ numeric, _id_setting numeric) OWNER TO postgres;

--
-- TOC entry 394 (class 1255 OID 220852)
-- Name: dml_setting_update(numeric, numeric, numeric, numeric, numeric, numeric, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_setting_update(id_user_ numeric, _id_setting numeric, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric, _deleted_setting boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_COUNT = (select count(*) from core.view_setting t where t.id_setting = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_setting t where t.id_setting = $2 and deleted_setting = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_setting t where t.id_setting = _id_setting and t.id_setting != _id_setting);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.setting SET expiration_token=$3, expiration_verification_code=$4, inactivity_time=$5, session_limit=$6, deleted_setting=$7 WHERE id_setting=$2 RETURNING id_setting LOOP
								_RETURNIG = _X.id_setting;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'setting',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_setting '||_id_setting||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_setting_update(id_user_ numeric, _id_setting numeric, _expiration_token numeric, _expiration_verification_code numeric, _inactivity_time numeric, _session_limit numeric, _deleted_setting boolean) OWNER TO postgres;

--
-- TOC entry 406 (class 1255 OID 220869)
-- Name: dml_system_event_create(numeric, character varying, numeric, character varying, timestamp without time zone, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_system_event_create(_id_user numeric, _table_system_event character varying, _row_system_event numeric, _action_system_event character varying, _date_system_event timestamp without time zone, _deleted_system_event boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_CURRENT_ID = (select nextval('core.serial_system_event')-1);
				_COUNT = (select count(*) from core.view_system_event t where t.id_system_event = _CURRENT_ID);
				
				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO core.system_event(id_system_event, id_user, table_system_event, row_system_event, action_system_event, date_system_event, deleted_system_event) VALUES (_CURRENT_ID, $1 , $2 , $3 , $4 , $5 , $6 ) RETURNING id_system_event LOOP
						_RETURNIG = _X.id_system_event;
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						RETURN true;
					ELSE
						_EXCEPTION = 'Ocurrió un error al insertar el registro';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE 
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_system_event'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_system_event_create(_id_user numeric, _table_system_event character varying, _row_system_event numeric, _action_system_event character varying, _date_system_event timestamp without time zone, _deleted_system_event boolean) OWNER TO postgres;

--
-- TOC entry 425 (class 1255 OID 220866)
-- Name: dml_user_create(numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_create(id_user_ numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- person
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_person v where v.id_person = _id_person);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_person||' de la tabla person no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- profile
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_profile v where v.id_profile = _id_profile);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_profile||' de la tabla profile no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_user')-1);
				_COUNT = (select count(*) from core.view_user t where t.id_user = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_user t where t.name_user = _name_user and t.id_company = _id_company);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.user(id_user, id_company, id_person, id_profile, type_user, name_user, password_user, avatar_user, status_user, deleted_user) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10 ) RETURNING id_user LOOP
							_RETURNIG = _X.id_user;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'user',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un usuario con el correo '||_name_user||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_user'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			
$_$;


ALTER FUNCTION core.dml_user_create(id_user_ numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean) OWNER TO postgres;

--
-- TOC entry 426 (class 1255 OID 220965)
-- Name: dml_user_create_modified(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_create_modified(id_user_ numeric) RETURNS TABLE(id_user numeric, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, deleted_user boolean, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, title_academic character varying, abbreviation_academic character varying, nivel_academic character varying, name_job character varying, address_job character varying, phone_job character varying, position_job character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMPANY NUMERIC;
				_ID_ACADEMIC NUMERIC;
				_ID_JOB NUMERIC;
				_ID_PERSON NUMERIC;
				_ID_PROFILE NUMERIC;
				_ID_USER NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_);
				
				_ID_ACADEMIC = (select * from core.dml_academic_create(id_user_, '', '', '', false));
				
				IF (_ID_ACADEMIC >= 1) THEN
					_ID_JOB = (select * from core.dml_job_create(id_user_, '', '', '', '', false));
					
					IF (_ID_JOB >= 1) THEN
						_ID_PERSON = (select * from core.dml_person_create(id_user_, _ID_ACADEMIC, _ID_JOB, '', 'Nuevo', 'usuario', '', '', false));
						
						IF (_ID_PERSON >= 1) THEN
							_ID_PROFILE = (select vp.id_profile from core.view_profile vp order by vp.id_profile asc limit 1);
							
							IF (_ID_PROFILE >= 1) THEN
								_ID_USER = (select * from core.dml_user_create(id_user_, _ID_COMPANY, _ID_PERSON, _ID_PROFILE, 'teacher', 'new.user@tsantsa.com', '', 'default.svg', false, false));
								
								IF (_ID_USER >= 1) THEN
									RETURN QUERY select vu.id_user, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vu.deleted_user, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, va.title_academic, va.abbreviation_academic, va.nivel_academic, vj.name_job, vj.address_job, vj.phone_job, vj.position_job, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile from core.view_user vu
										inner join core.view_company vc on vu.id_company = vc.id_company
										inner join core.view_person vp on vu.id_person = vp.id_person
										inner join core.view_academic va on vp.id_academic = va.id_academic
										inner join core.view_job vj on vp.id_job = vj.id_job
										inner join core.view_profile vpr on vu.id_profile = vpr.id_profile where vu.id_user = _ID_USER;
								ELSE
									_EXCEPTION = 'Ocurrió un error al ingresar el usuario';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								END IF;
							ELSE
								_EXCEPTION = 'No se encontró un el perfil';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al ingresar a la persona';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al ingresar la información laboral';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la información académica';
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
			
$$;


ALTER FUNCTION core.dml_user_create_modified(id_user_ numeric) OWNER TO postgres;

--
-- TOC entry 405 (class 1255 OID 220868)
-- Name: dml_user_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_delete(id_user_ numeric, _id_user numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_user t where t.id_user = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_user t where t.id_user = $2 and deleted_user = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','user', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.user SET deleted_user=true WHERE id_user = $2 RETURNING id_user LOOP
								_RETURNIG = _X.id_user;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'user',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_user_delete(id_user_ numeric, _id_user numeric) OWNER TO postgres;

--
-- TOC entry 430 (class 1255 OID 220967)
-- Name: dml_user_delete_modified(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_delete_modified(id_user_ numeric, _id_user numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
			 DECLARE
				_ID_PERSON NUMERIC;
				_ID_JOB NUMERIC;
				_ID_ACADEMIC NUMERIC;
				_DELETE_ACADEMIC BOOLEAN;
				_DELETE_JOB BOOLEAN;
				_DELETE_PERSON BOOLEAN;
			 	_DELETE_USER BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_ID_PERSON = (select vu.id_person from core.view_user vu where vu.id_user = _id_user);
				_ID_JOB = (select vp.id_job from core.view_person vp where vp.id_person = _ID_PERSON);
				_ID_ACADEMIC = (select va.id_academic from core.view_academic va where va.id_academic = _ID_PERSON);
			 
			 	_DELETE_USER = (select * from core.dml_user_delete(id_user_, _id_user));
				
				IF (_DELETE_USER) THEN
			 		_DELETE_PERSON = (select * from core.dml_person_delete(id_user_, _ID_PERSON));
					
					IF (_DELETE_PERSON) THEN
			 			_DELETE_JOB = (select * from core.dml_job_delete(id_user_, _ID_JOB));
						
						IF (_DELETE_JOB) THEN
							_DELETE_ACADEMIC = (select * from core.dml_academic_delete(id_user_, _ID_ACADEMIC));
							
							IF (_DELETE_ACADEMIC) THEN
								return true;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar la información académica';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al eliminar la información laboral';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al eliminar la persona';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al eliminar el usuario';
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
			 
$$;


ALTER FUNCTION core.dml_user_delete_modified(id_user_ numeric, _id_user numeric) OWNER TO postgres;

--
-- TOC entry 379 (class 1255 OID 220759)
-- Name: dml_user_remove_avatar(numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_remove_avatar(_id_user numeric) RETURNS TABLE(status_remove_avatar boolean, current_path character varying)
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_X RECORD;
	_ID_USER NUMERIC;
	_CURRENT_PATH CHARACTER VARYING;
	_NAME_USER CHARACTER VARYING;
	_ID_USER_DELETE NUMERIC;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	FOR _X IN select vu.id_user, vu.avatar_user, vu.name_user from core.view_user vu where vu.id_user = $1 LOOP 	
		_ID_USER = _X.id_user;
		_CURRENT_PATH  = _X.avatar_user;
		_NAME_USER = _X.name_user;
	END LOOP;
	-- Update Path	
	FOR _X IN UPDATE core.user u SET avatar_user = '' WHERE u.id_user = _ID_USER returning id_user LOOP 
		_ID_USER_DELETE = _X.id_user;
	END LOOP;
	IF (_ID_USER_DELETE >= 1) THEN
		RETURN QUERY select true as status_remove_avatar, _CURRENT_PATH as current_path;
	ELSE
		_EXCEPTION = 'Ocurrió un error al eliminar el avatar del user '||_NAME_USER||'';
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
$_$;


ALTER FUNCTION core.dml_user_remove_avatar(_id_user numeric) OWNER TO postgres;

--
-- TOC entry 427 (class 1255 OID 220867)
-- Name: dml_user_update(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_update(id_user_ numeric, _id_user numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- person
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_person v where v.id_person = _id_person);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_person||' de la tabla person no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			 
			-- profile
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_profile v where v.id_profile = _id_profile);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_profile||' de la tabla profile no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_user t where t.id_user = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_user t where t.id_user = $2 and deleted_user = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_user t where t.name_user = _name_user and t.id_user != _id_user);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.user SET id_company=$3, id_person=$4, id_profile=$5, type_user=$6, name_user=$7, password_user=$8, avatar_user=$9, status_user=$10, deleted_user=$11 WHERE id_user=$2 RETURNING id_user LOOP
								_RETURNIG = _X.id_user;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'user',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un usuario con el coreo '||_name_user||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 
$_$;


ALTER FUNCTION core.dml_user_update(id_user_ numeric, _id_user numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean) OWNER TO postgres;

--
-- TOC entry 429 (class 1255 OID 220966)
-- Name: dml_user_update_modified(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean, numeric, numeric, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_update_modified(id_user_ numeric, _id_user numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying) RETURNS TABLE(id_user numeric, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, deleted_user boolean, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, title_academic character varying, abbreviation_academic character varying, nivel_academic character varying, name_job character varying, address_job character varying, phone_job character varying, position_job character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean)
    LANGUAGE plpgsql
    AS $$
			 DECLARE
				_UPDATE_ACADEMIC BOOLEAN;
				_UPDATE_JOB BOOLEAN;
				_UPDATE_PERSON BOOLEAN;
			 	_UPDATE_USER BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_ACADEMIC = (select * from core.dml_academic_update(id_user_, _id_academic, _title_academic, _abbreviation_academic, _nivel_academic, false));
				
				IF (_UPDATE_ACADEMIC) THEN
					_UPDATE_JOB = (select * from core.dml_job_update(id_user_, _id_job, _name_job, _address_job, _phone_job, _position_job, false));
					
					IF (_UPDATE_JOB) THEN
						_UPDATE_PERSON = (select * from core.dml_person_update(id_user_, _id_person, _id_academic, _id_job, _dni_person, _name_person, _last_name_person, _address_person, _phone_person, false));
						
						IF (_UPDATE_PERSON) THEN
							_UPDATE_USER = (select * from core.dml_user_update(id_user_, _id_user, _id_company, _id_person, _id_profile, _type_user, _name_user, _password_user, _avatar_user, _status_user, false));
								
							IF (_UPDATE_USER) THEN
								RETURN QUERY select vu.id_user, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vu.deleted_user, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, va.title_academic, va.abbreviation_academic, va.nivel_academic, vj.name_job, vj.address_job, vj.phone_job, vj.position_job, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile from core.view_user vu
									inner join core.view_company vc on vu.id_company = vc.id_company
									inner join core.view_person vp on vu.id_person = vp.id_person
									inner join core.view_academic va on vp.id_academic = va.id_academic
									inner join core.view_job vj on vp.id_job = vj.id_job
									inner join core.view_profile vpr on vu.id_profile = vpr.id_profile where vu.id_user = _ID_USER;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el usuario';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al actualizar la información de la persona';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar la información laboral';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar la información académica';
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
			 
$$;


ALTER FUNCTION core.dml_user_update_modified(id_user_ numeric, _id_user numeric, _id_company numeric, _id_person numeric, _id_profile numeric, _type_user core."TYPE_USER", _name_user character varying, _password_user character varying, _avatar_user character varying, _status_user boolean, _deleted_user boolean, _id_academic numeric, _id_job numeric, _dni_person character varying, _name_person character varying, _last_name_person character varying, _address_person character varying, _phone_person character varying, _title_academic character varying, _abbreviation_academic character varying, _nivel_academic character varying, _name_job character varying, _address_job character varying, _phone_job character varying, _position_job character varying) OWNER TO postgres;

--
-- TOC entry 378 (class 1255 OID 220758)
-- Name: dml_user_upload_avatar(numeric, character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_user_upload_avatar(_id_user numeric, _new_avatar character varying) RETURNS TABLE(status_upload_avatar boolean, old_path character varying, new_path character varying)
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_X RECORD;
	_ID_USER NUMERIC;
	_OLD_PATH CHARACTER VARYING;
	_NAME_USER CHARACTER VARYING;
	_ID_USER_UPDATE NUMERIC;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	FOR _X IN select vu.id_user, vu.avatar_user, vu.name_user from core.view_user vu where vu.id_user = $1 LOOP 
		_ID_USER = _X.id_user;
		_OLD_PATH  = _X.avatar_user;
		_NAME_USER = _X.name_user;
	END LOOP;
	-- Update Path	
	FOR _X IN UPDATE core.user u SET avatar_user = _new_avatar WHERE u.id_user = _ID_USER returning id_user LOOP 
		_ID_USER_UPDATE = _X.id_user;
	END LOOP;
	
	IF (_ID_USER_UPDATE >= 1) THEN
		RETURN QUERY select true as status_upload_avatar, _OLD_PATH as old_path, _new_avatar as new_path;
	ELSE
		_EXCEPTION = 'Ocurrió un error al actualizar el avatar del usuario '||_NAME_USER||'';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
	END IF;
	exception when others then 
		-- RAISE NOTICE '%', SQLERRM;
		IF (_EXCEPTION = 'Internal Error') THEN
			RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database_auth';
		ELSE
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database_auth';
		END IF;
END;
			
$_$;


ALTER FUNCTION core.dml_user_upload_avatar(_id_user numeric, _new_avatar character varying) OWNER TO postgres;

--
-- TOC entry 396 (class 1255 OID 220854)
-- Name: dml_validation_create(numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_validation_create(id_user_ numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_CURRENT_ID = (select nextval('core.serial_validation')-1);
				_COUNT = (select count(*) from core.view_validation t where t.id_validation = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from core.view_validation t where t.id_validation = _CURRENT_ID);
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO core.validation(id_validation, id_company, type_validation, status_validation, pattern_validation, message_validation, deleted_validation) VALUES (_CURRENT_ID, $2 , $3 , $4 , $5 , $6 , $7 ) RETURNING id_validation LOOP
							_RETURNIG = _X.id_validation;
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'validation',_CURRENT_ID,'CREATE', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al insertar el registro';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ya existe un registro con el id_validation '||_id_validation||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||_CURRENT_ID||' ya se encuentra registrado';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE 'select setval(''core.serial_validation'', '||_CURRENT_ID||')';
					END IF;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			END;
			$_$;


ALTER FUNCTION core.dml_validation_create(id_user_ numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) OWNER TO postgres;

--
-- TOC entry 411 (class 1255 OID 220956)
-- Name: dml_validation_create_modified(numeric, core."TYPE_VALIDATION"); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_validation_create_modified(id_user_ numeric, _type_validation core."TYPE_VALIDATION") RETURNS TABLE(id_validation numeric, id_company numeric, type_validation core."TYPE_VALIDATION", status_validation boolean, pattern_validation character varying, message_validation character varying, deleted_validation boolean, name_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_ID_COMPANY NUMERIC;
				_COUNT_TYPE_VALIDATION NUMERIC;
				_ID_VALIDATION NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_COMPANY = (select vu.id_company from core.view_user vu where vu.id_user = id_user_);

				_COUNT_TYPE_VALIDATION = (select count(*) from core.view_validation vv where vv.type_validation = _type_validation and vv.id_company = _ID_COMPANY);
				
				IF (_COUNT_TYPE_VALIDATION = 0) THEN
					_ID_VALIDATION = (select * from core.dml_validation_create(id_user_, _ID_COMPANY, _type_validation, false, 'patter', 'mensaje', false));
					
					IF (_ID_VALIDATION >= 1) THEN
						RETURN QUERY select vv.id_validation, vv.id_company, vv.type_validation, vv.status_validation, vv.pattern_validation, vv.message_validation, vv.deleted_validation, vc.name_company, vc.status_company from core.view_validation vv
							inner join core.view_company vc on vv.id_company = vc.id_company where vv.id_validation = _ID_VALIDATION;
					ELSE
						_EXCEPTION = 'Ocurrió un error al ingresar la validación';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ya existe una validacion de tipo '||_type_validation||'';
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
			
$$;


ALTER FUNCTION core.dml_validation_create_modified(id_user_ numeric, _type_validation core."TYPE_VALIDATION") OWNER TO postgres;

--
-- TOC entry 398 (class 1255 OID 220856)
-- Name: dml_validation_delete(numeric, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_validation_delete(id_user_ numeric, _id_validation numeric) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_COUNT = (select count(*) from core.view_validation t where t.id_validation = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_validation t where t.id_validation = $2 and deleted_validation = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('core','validation', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = 'No se puede eliminar el registro, mantiene dependencia en otros procesos.';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						ELSE
							FOR _X IN UPDATE core.validation SET deleted_validation=true WHERE id_validation = $2 RETURNING id_validation LOOP
								_RETURNIG = _X.id_validation;
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'validation',$2,'DELETE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al eliminar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = 'EL registro ya se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_validation_delete(id_user_ numeric, _id_validation numeric) OWNER TO postgres;

--
-- TOC entry 397 (class 1255 OID 220855)
-- Name: dml_validation_update(numeric, numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_validation_update(id_user_ numeric, _id_validation numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_EXTERNALS_IDS NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN 
			-- company
			_COUNT_EXTERNALS_IDS = (select count(*) from core.view_company v where v.id_company = _id_company);
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = 'El id '||_id_company||' de la tabla company no se encuentra registrado';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
			
				_COUNT = (select count(*) from core.view_validation t where t.id_validation = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from core.view_validation t where t.id_validation = $2 and deleted_validation = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from core.view_validation t where t.id_validation = _id_validation and t.id_validation != _id_validation);
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE core.validation SET id_company=$3, type_validation=$4, status_validation=$5, pattern_validation=$6, message_validation=$7, deleted_validation=$8 WHERE id_validation=$2 RETURNING id_validation LOOP
								_RETURNIG = _X.id_validation;
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'validation',$2,'UPDATE', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = 'Ocurrió un error al registrar el evento del sistema';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al actualizar el registro';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ya existe un registro con el id_validation '||_id_validation||'';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE 
						_EXCEPTION = 'EL registro se encuentra eliminado';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'El registro con id '||$2||' no se encuentra registrado';
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
			 $_$;


ALTER FUNCTION core.dml_validation_update(id_user_ numeric, _id_validation numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) OWNER TO postgres;

--
-- TOC entry 412 (class 1255 OID 220957)
-- Name: dml_validation_update_modified(numeric, numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.dml_validation_update_modified(id_user_ numeric, _id_validation numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) RETURNS TABLE(id_validation numeric, id_company numeric, type_validation core."TYPE_VALIDATION", status_validation boolean, pattern_validation character varying, message_validation character varying, deleted_validation boolean, name_company character varying, status_company boolean)
    LANGUAGE plpgsql
    AS $$
			DECLARE
				_COUNT_TYPE_VALIDATION NUMERIC;
				_UPDATE_VALIDATION BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_COUNT_TYPE_VALIDATION = (select count(*) from core.view_validation vv where vv.type_validation = _type_validation and vv.id_validation != _id_validation and vv.id_company = _id_company);
				
				IF (_COUNT_TYPE_VALIDATION = 0) THEN
					_UPDATE_VALIDATION = (select * from core.dml_validation_update(id_user_, _id_validation, _id_company, _type_validation, _status_validation, _pattern_validation, _message_validation, false));
					
					IF (_UPDATE_VALIDATION) THEN
						RETURN QUERY select vv.id_validation, vv.id_company, vv.type_validation, vv.status_validation, vv.pattern_validation, vv.message_validation, vv.deleted_validation, vc.name_company, vc.status_company from core.view_validation vv
							inner join core.view_company vc on vv.id_company = vc.id_company where vv.id_validation = _ID_VALIDATION;
					ELSE
						_EXCEPTION = 'Ocurrió un error al actualizar la validación';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ya existe una validacion de tipo '||_type_validation||'';
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
			
$$;


ALTER FUNCTION core.dml_validation_update_modified(id_user_ numeric, _id_validation numeric, _id_company numeric, _type_validation core."TYPE_VALIDATION", _status_validation boolean, _pattern_validation character varying, _message_validation character varying, _deleted_validation boolean) OWNER TO postgres;

--
-- TOC entry 364 (class 1255 OID 220744)
-- Name: global_encryption_password(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.global_encryption_password() RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
	-- (OJO) LA CONTRASEÑA TIENE QUE SER DE 16 DIGITOS --
  	_PASSWORD TEXT DEFAULT 'eNcR$TsAnTs$2022';
	BEGIN
		RETURN _PASSWORD;
	END;
$_$;


ALTER FUNCTION core.global_encryption_password() OWNER TO postgres;

--
-- TOC entry 350 (class 1255 OID 220706)
-- Name: global_save_log(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.global_save_log() RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
  	_STATE_SAVE_LOGS BOOLEAN DEFAULT true;
	BEGIN	
		RETURN _STATE_SAVE_LOGS;
	END;
$$;


ALTER FUNCTION core.global_save_log() OWNER TO postgres;

--
-- TOC entry 370 (class 1255 OID 220750)
-- Name: security_cap_aes_decrypt(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_aes_decrypt(_text_encrypted character varying) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
  	_HEX TEXT DEFAULT '';
  	_PASS_ENCRYPT_ENCRYPTED TEXT DEFAULT '';
  	_TEXT_ALGORITHM_ENCRYPTED TEXT DEFAULT '';
  	_TEXT TEXT DEFAULT '';
	BEGIN
		_PASS_ENCRYPT_ENCRYPTED = (select * from core.security_cap_algorithm_encrypt((select * from core.global_encryption_password())));
		_HEX = (select encode((_PASS_ENCRYPT_ENCRYPTED)::bytea, 'hex'));
		
		_TEXT_ALGORITHM_ENCRYPTED = (select convert_from(
		  core.decrypt_iv(
			decode(''||$1||'','base64')::bytea,
			decode(''||_HEX||'','hex')::bytea,
			decode(''||_HEX||'','hex')::bytea, 
			'aes'
		  ),
		  'utf8'
		));
		
		_TEXT = (select * from core.security_cap_algorithm_decrypt(_TEXT_ALGORITHM_ENCRYPTED));
	
		RETURN _TEXT;
	END;
$_$;


ALTER FUNCTION core.security_cap_aes_decrypt(_text_encrypted character varying) OWNER TO postgres;

--
-- TOC entry 369 (class 1255 OID 220749)
-- Name: security_cap_aes_encrypt(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_aes_encrypt(_text character varying) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
  	_HEX TEXT DEFAULT '';
	_PASS_ENCRYPT_ENCRYPTED TEXT DEFAULT '';
	_TEXT_ENCRYPTED TEXT DEFAULT '';
  	_CIPHER_TEXT TEXT DEFAULT '';
	_CIPHER_TEXT_BASE64 TEXT DEFAULT '';
	BEGIN	
		_PASS_ENCRYPT_ENCRYPTED = (select * from core.security_cap_algorithm_encrypt((select * from core.global_encryption_password())));
		_TEXT_ENCRYPTED = (select * from core.security_cap_algorithm_encrypt($1));
		
		_HEX = (select encode((_PASS_ENCRYPT_ENCRYPTED)::bytea, 'hex'));
		
		_CIPHER_TEXT = (select core.encrypt_iv(
			(''||_TEXT_ENCRYPTED||'')::bytea,
			decode(''||_HEX||'','hex')::bytea,
			decode(''||_HEX||'','hex')::bytea,
			'aes'::text
		  )::text);
		  
		  _CIPHER_TEXT_BASE64 = (select encode((''||_CIPHER_TEXT||'')::bytea, 'base64'));
		  
		RETURN _CIPHER_TEXT_BASE64;
	END;
$_$;


ALTER FUNCTION core.security_cap_aes_encrypt(_text character varying) OWNER TO postgres;

--
-- TOC entry 368 (class 1255 OID 220748)
-- Name: security_cap_algorithm_decrypt(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_algorithm_decrypt(_string_position_invert character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  	_STRING_INVERT TEXT DEFAULT '';
	_TEXT TEXT DEFAULT '';
	BEGIN	
		_STRING_INVERT = (select * from core.security_cap_string_position_invert(_string_position_invert));
		_TEXT = (select * from core.security_cap_string_invert(_STRING_INVERT));
		RETURN _TEXT;
	END;
$$;


ALTER FUNCTION core.security_cap_algorithm_decrypt(_string_position_invert character varying) OWNER TO postgres;

--
-- TOC entry 367 (class 1255 OID 220747)
-- Name: security_cap_algorithm_encrypt(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_algorithm_encrypt(_text character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  	_STRING_INVERT TEXT DEFAULT '';
	_STRING_POSITION_INVERT TEXT DEFAULT '';
	BEGIN	
		_STRING_INVERT = (select * from core.security_cap_string_invert(_text));
		_STRING_POSITION_INVERT = (select * from core.security_cap_string_position_invert(_STRING_INVERT));
		RETURN _STRING_POSITION_INVERT;
	END;
$$;


ALTER FUNCTION core.security_cap_algorithm_encrypt(_text character varying) OWNER TO postgres;

--
-- TOC entry 365 (class 1255 OID 220745)
-- Name: security_cap_string_invert(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_string_invert(_string character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  	_INVERTED TEXT DEFAULT '';
	H_ TEXT DEFAULT '';
	_X RECORD;
	BEGIN	
		FOR _X IN REVERSE char_length(_string)..1 LOOP
			_INVERTED = CONCAT(_INVERTED, (select substring(_string, _X, 1)));
        END LOOP;
		RETURN _INVERTED;
	END;
$$;


ALTER FUNCTION core.security_cap_string_invert(_string character varying) OWNER TO postgres;

--
-- TOC entry 366 (class 1255 OID 220746)
-- Name: security_cap_string_position_invert(character varying); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.security_cap_string_position_invert(_string character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  	_POSITION_INVERTED TEXT DEFAULT '';
	_FIRST TEXT DEFAULT '';
	_SECOND TEXT DEFAULT '';
	_INTERMEDIATE_POSITION INTEGER;
	_X RECORD;
	BEGIN	
		_INTERMEDIATE_POSITION = char_length(_string) / 2;
		_FIRST = substring(_string, 1, _INTERMEDIATE_POSITION);
		
		IF (char_length(_string) % 2 = 0)THEN
			_SECOND = substring(_string, _INTERMEDIATE_POSITION +1, char_length(_string));
			_POSITION_INVERTED = CONCAT(_SECOND,_FIRST);
		ELSE 
			_SECOND = substring(_string, _INTERMEDIATE_POSITION +2, char_length(_string));
			_POSITION_INVERTED = CONCAT(_SECOND,substring(_string, _INTERMEDIATE_POSITION+1, 1),_FIRST);
		END IF;
		RETURN _POSITION_INVERTED;
	END;
$$;


ALTER FUNCTION core.security_cap_string_position_invert(_string character varying) OWNER TO postgres;

--
-- TOC entry 372 (class 1255 OID 220751)
-- Name: utils_get_date_maximum_hour(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.utils_get_date_maximum_hour() RETURNS timestamp without time zone
    LANGUAGE plpgsql
    AS $$
			 DECLARE
			 	_DAY DOUBLE PRECISION;
				_DAY_FINAL CHARACTER VARYING;
			 	_MONTH DOUBLE PRECISION;
				_MONTH_FINAL CHARACTER VARYING;
			 	_YEAR DOUBLE PRECISION;
			 	_YEAR_FINAL CHARACTER VARYING;
				_DATE CHARACTER VARYING;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_DAY = (select extract(day from now()::timestamp));
				_MONTH = (select extract(month from now()::timestamp));
				_YEAR = (select extract(year from now()::timestamp));
				
				IF (_DAY <= 9) THEN
					_DAY_FINAL = '0'||_DAY||'';
				ELSE
					_DAY_FINAL = ''||_DAY||'';
				END IF;
				
				IF (_MONTH <= 9) THEN
					_MONTH_FINAL = '0'||_MONTH||'';
				ELSE
					_MONTH_FINAL = ''||_MONTH||'';
				END IF;
				
				_YEAR_FINAL = ''||_YEAR||'';
				
				_DATE = ''||_YEAR_FINAL||'-'||_MONTH_FINAL||'-'||_DAY_FINAL||' 23:59:59';
				
				return _DATE::timestamp without time zone;
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 
$$;


ALTER FUNCTION core.utils_get_date_maximum_hour() OWNER TO postgres;

--
-- TOC entry 338 (class 1255 OID 220695)
-- Name: utils_get_table_dependency(character varying, character varying, numeric); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.utils_get_table_dependency(_schema character varying, _table_name character varying, _id_deleted numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT_TABLE NUMERIC;
				_COUNT_ID NUMERIC;
				_COUNT NUMERIC = 0;
				_COUNT_ROW_DELETED NUMERIC; 
				_TABLE CHARACTER VARYING DEFAULT '';
				_ID CHARACTER VARYING DEFAULT '';
				_X RECORD;
				_Y RECORD;
				_Z RECORD;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
				_COUNT_TABLE = (SELECT count(*) FROM information_schema.tables t WHERE t.table_schema = ''||$1||'' and t.table_type = 'BASE TABLE' and t.table_name = ''||$2||'');
				
				IF (_COUNT_TABLE != 1) THEN
					_EXCEPTION = 'La tabla '||$2||' no se encuentra registrada';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				ELSE
					FOR _X IN EXECUTE 'SELECT count(*) FROM '||$1||'.'||$2||' t WHERE t.id_'||$2||' = '||$3||'' LOOP
						_COUNT_ID = _X.count;
					END LOOP;
					
					IF (_COUNT_ID = 0) THEN
						_EXCEPTION = 'El registro con id '||$3||' no se encuentra registrado en la tabla '||$2||'';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					ELSE 
						FOR _Y IN SELECT c.table_name::character varying as _table FROM information_schema.columns c WHERE c.table_schema = ''||$1||'' and c.column_name = 'id_'||$2||'' and c.is_nullable = 'NO' and c.ordinal_position != 1 LOOP
							_TABLE = ''||$1||'.'||_Y._table||'';
							_ID = 't.id_'||$2||'';
							
							_COUNT_ROW_DELETED = (SELECT count(*) FROM information_schema.columns t WHERE t.table_schema = ''||$1||'' and t.table_name = ''||_Y._table||'' and t.column_name = 'deleted_'||_Y._table||'');
							
							IF (_COUNT_ROW_DELETED) THEN
								FOR _Z IN EXECUTE 'select count(*) from '||$1||'.view_'||_Y._table||' t where '||_ID||' = '||$3||'' LOOP
									_COUNT = _COUNT + _Z.count;
								END LOOP;
							ELSE
								FOR _Z IN EXECUTE 'select count(*) from '||_TABLE||' t where '||_ID||' = '||$3||'' LOOP
									_COUNT = _COUNT + _Z.count;
								END LOOP;
							END IF;
						END LOOP;
						RETURN _COUNT;
					END IF;
				END IF;
					
				exception when others then 
					-- RAISE NOTICE '%', SQLERRM;
					IF (_EXCEPTION = 'Internal Error') THEN
						RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
					ELSE
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
			 END;
			 -- select * from core.utils_get_table_dependency('core','user', 1)
			 
$_$;


ALTER FUNCTION core.utils_get_table_dependency(_schema character varying, _table_name character varying, _id_deleted numeric) OWNER TO postgres;

--
-- TOC entry 342 (class 1255 OID 220697)
-- Name: ddl_config(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_config(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_X RECORD;
	_COLUMN_NAME TEXT DEFAULT '';
BEGIN
	
	EXECUTE 'DROP TABLE IF EXISTS dev.ddl_config';
	
	EXECUTE '
	CREATE TABLE dev.ddl_config
	(
	  table_name character varying(100),
	  sequence boolean,
	  view boolean,
	  crud boolean,
	  haved_handler_attribute character varying(100)
	)
	WITH (
	  OIDS=FALSE
	);
	ALTER TABLE dev.ddl_config
	  OWNER TO postgres;
	';
  
	FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
		_COLUMN_NAME = (select c.column_name from information_schema.columns c where c.table_schema = ''||_SCHEMA||'' and c.table_name = ''||_X.table_name||'' and c.ordinal_position = 1);
		IF (_COLUMN_NAME = 'id_'||_X.table_name||'') THEN
			INSERT INTO dev.ddl_config(table_name, sequence, view, crud, haved_handler_attribute) VALUES (_X.table_name, true, true, true, 'id_'||_X.table_name||'');
		END IF;
	END LOOP;
	RETURN true;
END;
$$;


ALTER FUNCTION dev.ddl_config(_schema character varying) OWNER TO postgres;

--
-- TOC entry 343 (class 1255 OID 220698)
-- Name: ddl_create_crud(character varying, character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_create_crud(_schema character varying, _table_name character varying, _duplicate_handler_attribute character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_PARAMS TEXT DEFAULT '';
	_PARAMS_EXCLUDE_ID TEXT DEFAULT '';
	_PARAM_DELETE TEXT DEFAULT '';
	_VALUES_INSERT TEXT DEFAULT '';
	_VALUES_INSERT_PLUS TEXT DEFAULT '';
	_QUERY_UPDATE TEXT DEFAULT '';
	_COLUMNS TEXT DEFAULT '';
	_COLUMNS_ALIAS TEXT DEFAULT '';
	_COLUMNS_TYPE TEXT DEFAULT '';
	_EXTERNAL_ID_VALIDATION TEXT DEFAULT '';
	_EXTERNAL_ID_VALIDATION_ATTRIBUTE TEXT DEFAULT '';
	_HAVED_COLUMN_DELETED CHARACTER VARYING DEFAULT '';
	_HAVED_HANDLER_ATTRIBUTE NUMERIC;
	_ATTRIBUTE_TO_QUERY CHARACTER VARYING DEFAULT '';
	
	_SERIAL_TABLE TEXT DEFAULT '';
	
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	_PARAMS = (select dev.utils_get_params($1,$2));
	_PARAMS_EXCLUDE_ID = (select dev.utils_get_params_exclude_id($1,$2));
	_PARAM_DELETE = (select dev.utils_get_param_delete($1,$2));
	_VALUES_INSERT = (select dev.utils_get_values_insert($1,$2, 1));
	_VALUES_INSERT_PLUS = (select dev.utils_get_values_insert($1,$2, 0));
	_QUERY_UPDATE = (select dev.utils_get_query_update($1,$2));
	_COLUMNS = (select dev.utils_get_columns($1,$2));
	_COLUMNS_ALIAS = (select dev.utils_get_columns_alias($1,$2));
	_COLUMNS_TYPE = (select dev.utils_get_columns_type($1,$2));
	_EXTERNAL_ID_VALIDATION = (select * from dev.utils_generate_external_id_validation($1,$2));
	
	IF (_EXTERNAL_ID_VALIDATION != '') THEN 
		_EXTERNAL_ID_VALIDATION_ATTRIBUTE = '
				_COUNT_EXTERNALS_IDS NUMERIC;';
	END IF;

	_SERIAL_TABLE = ''||$1||'.serial_'||$2||'';
	
	_HAVED_COLUMN_DELETED = (select (select c.column_name as column from information_schema.columns c where c.table_schema = ''||$1||'' and c.table_name = ''||$2||'' and c.column_name = 'deleted_'||$2||'')::character varying);
	
	-- Verificar si el _duplicate_handler_attribute existe en la tabla ingresada
	_HAVED_HANDLER_ATTRIBUTE = (select count(*) from information_schema.columns c where c.table_schema = ''||$1||'' and c.table_name = ''||$2||'' and c.column_name = ''||$3||'');

	IF (_HAVED_HANDLER_ATTRIBUTE = 0) THEN 
		_EXCEPTION = 'El atributo '||$3||' no existe en la tabla '||$2||'';
		RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
	END IF;
	
	-- COMPARAR SI LA TABLE ES EVENTOS DEL SISTEMA --
	
	IF ($2 = 'system_event') THEN
		--CREATE
		EXECUTE '
			CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_create('||_PARAMS_EXCLUDE_ID||')
			RETURNS boolean AS
			''
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			BEGIN
				_CURRENT_ID = (select nextval('''''||_SERIAL_TABLE||''''')-1);
				_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = _CURRENT_ID);
				
				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO '||$1||'.'||$2||'('||_COLUMNS||') VALUES (_CURRENT_ID, '||_VALUES_INSERT||') RETURNING id_'||$2||' LOOP
						_RETURNIG = _X.id_'||$2||';
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						RETURN true;
					ELSE
						_EXCEPTION = ''''Ocurrió un error al insertar el registro'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE 
					_EXCEPTION = ''''El registro con id ''''||_CURRENT_ID||'''' ya se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE ''''select setval('''''''''||_SERIAL_TABLE||''''''''', ''''||_CURRENT_ID||'''')'''';
					END IF;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			END;
			''
			  LANGUAGE plpgsql VOLATILE
			  COST 100;
				';
	ELSE
		IF (_HAVED_COLUMN_DELETED = 'deleted_'||$2||'') THEN
			--CREATE
			IF ($3 = 'id_'||$2||'') THEN
				_ATTRIBUTE_TO_QUERY = '_CURRENT_ID';
			ELSE
				_ATTRIBUTE_TO_QUERY = '_'||$3||'';
			END IF;
		
        EXECUTE '
			CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_create(id_user_ numeric,'||_PARAMS_EXCLUDE_ID||')
			RETURNS NUMERIC AS
			''
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;'||_EXTERNAL_ID_VALIDATION_ATTRIBUTE||'
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			BEGIN'||_EXTERNAL_ID_VALIDATION||'
				_CURRENT_ID = (select nextval('''''||_SERIAL_TABLE||''''')-1);
				_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = _CURRENT_ID);

				IF (_COUNT = 0) THEN
				
					_COUNT_ATT = (select count(*) from '||$1||'.view_'||$2||' t where t.'||$3||' = '||_ATTRIBUTE_TO_QUERY||');
				
					IF (_COUNT_ATT = 0) THEN 
						FOR _X IN INSERT INTO '||$1||'.'||$2||'('||_COLUMNS||') VALUES (_CURRENT_ID, '||_VALUES_INSERT_PLUS||') RETURNING id_'||$2||' LOOP
							_RETURNIG = _X.id_'||$2||';
						END LOOP;

						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',_CURRENT_ID,''''CREATE'''', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
									RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
								ELSE
									RETURN _CURRENT_ID;
								END IF;
							ELSE 
								RETURN _CURRENT_ID;
							END IF;
						ELSE
							_EXCEPTION = ''''Ocurrió un error al insertar el registro'''';
							RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
						END IF;
					ELSE
						_EXCEPTION = ''''Ya existe un registro con el '||$3||' ''''||_'||$3||'||'''''''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||_CURRENT_ID||'''' ya se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE ''''select setval('''''''''||_SERIAL_TABLE||''''''''', ''''||_CURRENT_ID||'''')'''';
					END IF;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			END;
			''
			  LANGUAGE plpgsql VOLATILE
			  COST 100;
				';

        --UPDATE
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_update(id_user_ numeric,'||_PARAMS||')
			 RETURNS boolean AS
			 ''
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_ATT NUMERIC;
				_COUNT_DELETED NUMERIC;'||_EXTERNAL_ID_VALIDATION_ATTRIBUTE||'
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN'||_EXTERNAL_ID_VALIDATION||'
				_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2);
				
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2 and deleted_'||$2||' = true); 
					IF (_COUNT_DELETED = 0) THEN
						
						_COUNT_ATT = (select count(*) from '||$1||'.view_'||$2||' t where t.'||$3||' = _'||$3||' and t.id_'||$2||' != _id_'||$2||');
						
						IF (_COUNT_ATT = 0) THEN 
							FOR _X IN UPDATE '||$1||'.'||_TABLE_NAME||' '||_QUERY_UPDATE||' RETURNING id_'||$2||' LOOP
								_RETURNIG = _X.id_'||$2||';
							END LOOP;

							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',$2,''''UPDATE'''', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
										RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = ''''Ocurrió un error al actualizar el registro'''';
								RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
							END IF;
						ELSE
							_EXCEPTION = ''''Ya existe un registro con el '||$3||' ''''||_'||$3||'||'''''''';
							RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
						END IF;
					ELSE 
						_EXCEPTION = ''''EL registro se encuentra eliminado'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||$2||'''' no se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';

		--DELETE
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_delete(id_user_ numeric,'||_PARAM_DELETE||')
			 RETURNS boolean AS
			 ''
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DELETED NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN
			 	_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DELETED = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2 and deleted_'||$2||' = true); 
					IF (_COUNT_DELETED = 0) THEN 
						_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('''''||$1||''''','''''||$2||''''', $2));
						
						IF (_COUNT_DEPENDENCY > 0) THEN
							_EXCEPTION = ''''No se puede eliminar el registro, mantiene dependencia en otros procesos.'''';
							RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
						ELSE
							FOR _X IN UPDATE '||$1||'.'||_TABLE_NAME||' SET deleted_'||_TABLE_NAME||'=true WHERE id_'||_TABLE_NAME||' = $2 RETURNING id_'||$2||' LOOP
								_RETURNIG = _X.id_'||$2||';
							END LOOP;
							IF (_RETURNIG >= 1) THEN
								_SAVE_LOG = (select * from core.global_save_log());
								IF (_SAVE_LOG) THEN
									_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',$2,''''DELETE'''', now()::timestamp, false));
									IF (_RESPONSE != true) THEN
										_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
										RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
									ELSE
										RETURN _RESPONSE;
									END IF;
								ELSE
									RETURN true;
								END IF;
							ELSE
								_EXCEPTION = ''''Ocurrió un error al eliminar el registro'''';
								RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
							END IF;
						END IF;
					ELSE
						_EXCEPTION = ''''EL registro ya se encuentra eliminado'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||$2||'''' no se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';
		ELSE 
		--CREATE
        EXECUTE '
			CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_create(id_user_ numeric,'||_PARAMS_EXCLUDE_ID||')
			RETURNS NUMERIC AS
			''
			DECLARE
				_RESPONSE BOOLEAN DEFAULT false;
				_COUNT NUMERIC;'||_EXTERNAL_ID_VALIDATION_ATTRIBUTE||'
				_RETURNIG NUMERIC;
				_CURRENT_ID NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			BEGIN'||_EXTERNAL_ID_VALIDATION||'
				_CURRENT_ID = (select nextval('''''||_SERIAL_TABLE||''''')-1);
				_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = _CURRENT_ID);

				IF (_COUNT = 0) THEN
					FOR _X IN INSERT INTO '||$1||'.'||$2||'('||_COLUMNS||') VALUES (_CURRENT_ID, '||_VALUES_INSERT_PLUS||') RETURNING id_'||$2||' LOOP
						_RETURNIG = _X.id_'||$2||';
					END LOOP;
					
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',_CURRENT_ID,''''CREATE'''', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
								RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
							ELSE
								RETURN _CURRENT_ID;
							END IF;
						ELSE 
							RETURN _CURRENT_ID;
						END IF;
					ELSE
						_EXCEPTION = ''''Ocurrió un error al insertar el registro'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||_CURRENT_ID||'''' ya se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_CURRENT_ID >= 1) THEN
						EXECUTE ''''select setval('''''''''||_SERIAL_TABLE||''''''''', ''''||_CURRENT_ID||'''')'''';
					END IF;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			END;
			''
			  LANGUAGE plpgsql VOLATILE
			  COST 100;
				';
        --UPDATE
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_update(id_user_ numeric,'||_PARAMS||')
			 RETURNS boolean AS
			 ''
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;'||_EXTERNAL_ID_VALIDATION_ATTRIBUTE||'
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN'||_EXTERNAL_ID_VALIDATION||'
			 	_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2);
			
				IF (_COUNT = 1) THEN
					FOR _X IN UPDATE '||$1||'.'||_TABLE_NAME||' '||_QUERY_UPDATE||' RETURNING id_'||$2||' LOOP
						_RETURNIG = _X.id_'||$2||';
					END LOOP;
						
					IF (_RETURNIG >= 1) THEN
						_SAVE_LOG = (select * from core.global_save_log());
						IF (_SAVE_LOG) THEN
							_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',$2,''''UPDATE'''', now()::timestamp, false));
							IF (_RESPONSE != true) THEN
								_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
								RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
							ELSE
								RETURN _RESPONSE;
							END IF;
						ELSE
							RETURN true;
						END IF;
					ELSE
						_EXCEPTION = ''''Ocurrió un error al actualizar el registro'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||$2||'''' no se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';
		--DELETE
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_delete(id_user_ numeric,'||_PARAM_DELETE||')
			 RETURNS boolean AS
			 ''
			 DECLARE
				_RESPONSE boolean DEFAULT false;
				_COUNT NUMERIC;
				_COUNT_DEPENDENCY NUMERIC;
				_RETURNIG NUMERIC;
				_X RECORD;
				_SAVE_LOG BOOLEAN DEFAULT false;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN
			 	_COUNT = (select count(*) from '||$1||'.view_'||$2||' t where t.id_'||$2||' = $2);
					
				IF (_COUNT = 1) THEN
					_COUNT_DEPENDENCY = (select * from core.utils_get_table_dependency('''''||$1||''''','''''||$2||''''', $2));
						
					IF (_COUNT_DEPENDENCY > 0) THEN
						_EXCEPTION = ''''No se puede eliminar el registro, mantiene dependencia en otros procesos.'''';
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					ELSE
						FOR _X IN DELETE FROM '||$1||'.'||_TABLE_NAME||' WHERE id_'||_TABLE_NAME||' = $2 RETURNING id_'||$2||' LOOP
							_RETURNIG = _X.id_'||$2||';
						END LOOP;
						IF (_RETURNIG >= 1) THEN
							_SAVE_LOG = (select * from core.global_save_log());
							IF (_SAVE_LOG) THEN
								_RESPONSE = (core.dml_system_event_create($1,'''''||$2||''''',$2,''''DELETE'''', now()::timestamp, false));
								IF (_RESPONSE != true) THEN
									_EXCEPTION = ''''Ocurrió un error al registrar el evento del sistema'''';
									RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
								ELSE
									RETURN _RESPONSE;
								END IF;
							ELSE
								RETURN true;
							END IF;
						ELSE
							_EXCEPTION = ''''Ocurrió un error al eliminar el registro'''';
							RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
						END IF;
					END IF;
				ELSE
					_EXCEPTION = ''''El registro con id ''''||$2||'''' no se encuentra registrado'''';
					RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';
		END IF;
	END IF;
	RETURN true; 
	exception when others then 
		-- RAISE NOTICE '%', SQLERRM;
		IF (_EXCEPTION = 'Internal Error') THEN
			RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
		ELSE
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
		END IF;
	
END;
$_$;


ALTER FUNCTION dev.ddl_create_crud(_schema character varying, _table_name character varying, _duplicate_handler_attribute character varying) OWNER TO postgres;

--
-- TOC entry 344 (class 1255 OID 220700)
-- Name: ddl_create_crud_modified(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_create_crud_modified(_schema character varying, _table_name character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_PARAMS TEXT DEFAULT '';
	_PARAM_DELETE TEXT DEFAULT '';
	_COLUMNS_TYPE TEXT DEFAULT '';
	_SERIAL_TABLE TEXT DEFAULT '';
	_EXCEPTION TEXT DEFAULT 'Internal Error';
BEGIN
	_PARAMS = (select dev.utils_get_params($1,$2));
	_PARAM_DELETE = (select dev.utils_get_param_delete($1,$2));
	_COLUMNS_TYPE = (select dev.utils_get_columns_type($1,$2));

	_SERIAL_TABLE = ''||$1||'.serial_'||$2||'';
		--CREATE
        EXECUTE '
			CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_create_modified(id_user_ numeric)
			RETURNS TABLE('||_COLUMNS_TYPE||') AS
			''
			DECLARE
				_ID_'||UPPER($2)||' NUMERIC;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			BEGIN
				-- _ID_'||UPPER($2)||' = (select * from '||$1||'.dml_'||$2||'_create(columns));

				-- IF (_ID_'||UPPER($2)||' >= 1) THEN
					-- RETURN QUERY;
				-- ELSE
					-- _EXCEPTION = ''''Ocurrió un error al ingresar '||$2||''''';
					-- RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				-- END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			END;
			''
			  LANGUAGE plpgsql VOLATILE
			  COST 100;
				';

		--UPDATE
		
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_update_modified(id_user_ numeric,'||_PARAMS||')
			 RETURNS TABLE('||_COLUMNS_TYPE||') AS
			 ''
			 DECLARE
			 	_UPDATE_'||UPPER($2)||' BOOLEAN;
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN
			 	-- _UPDATE_'||UPPER($2)||' = (select * from '||$1||'.dml_'||$2||'_update(columns));

			 	-- IF (_UPDATE_'||UPPER($2)||') THEN
					-- RETURN QUERY ; 
				-- ELSE
					-- _EXCEPTION = ''''Ocurrió un error al actualizar '||$2||''''';
					-- RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
				-- END IF;
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';
		--DELETE
        EXECUTE '
			 CREATE OR REPLACE FUNCTION '||$1||'.dml_'||$2||'_delete_modified(id_user_ numeric,'||_PARAM_DELETE||')
			 RETURNS boolean AS
			 ''
			 DECLARE
				_EXCEPTION TEXT DEFAULT ''''Internal Error'''';
			 BEGIN
			 	-- Obtener los ids de los registros que se eliminaran
				-- select * from dev.utils_get_columns_type('''''||$1||''''', '''''''')
				
				-- Eliminar registros en cascada
				
				-- Retornar true
				exception when others then 
					-- RAISE NOTICE ''''%'''', SQLERRM;
					IF (_EXCEPTION = ''''Internal Error'''') THEN
						RAISE EXCEPTION ''''%'''',SQLERRM USING DETAIL = ''''_database'''';
					ELSE
						RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
					END IF;
			 END;
			 ''
			  LANGUAGE plpgsql VOLATILE
			  COST 100
				 ';
	RETURN true; 
	exception when others then 
		-- RAISE NOTICE '%', SQLERRM;
		IF (_EXCEPTION = 'Internal Error') THEN
			RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
		ELSE
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
		END IF;
	
END;
$_$;


ALTER FUNCTION dev.ddl_create_crud_modified(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 345 (class 1255 OID 220701)
-- Name: ddl_create_sequences(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_create_sequences(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_LIMIT_NUMBER NUMERIC;
	_IS_TRUE BOOLEAN DEFAULT false;
	_X RECORD;
	_Y RECORD;
BEGIN
	FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
		_IS_TRUE = (select dc.sequence from dev.ddl_config dc where dc.table_name = ''||_X.table_name||'');
				
		IF (_IS_TRUE) THEN
			FOR _Y IN EXECUTE 'SELECT c.numeric_precision as logitud_identificador FROM information_schema.columns c WHERE table_name = '''||_X.table_name||''' and c.ordinal_position = 1' LOOP
				_LIMIT_NUMBER = (select dev.utils_limit_number(_Y.logitud_identificador));
			END LOOP;
			EXECUTE 'CREATE SEQUENCE IF NOT EXISTS '||_SCHEMA||'.serial_'||_X.table_name||' INCREMENT 1 MINVALUE  1 MAXVALUE '||_LIMIT_NUMBER||' START 1 CACHE 1';
		END IF;
	END LOOP;
	RETURN true;
END;
$$;


ALTER FUNCTION dev.ddl_create_sequences(_schema character varying) OWNER TO postgres;

--
-- TOC entry 346 (class 1255 OID 220702)
-- Name: ddl_create_view(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_create_view(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_IS_TRUE BOOLEAN DEFAULT false;
	_HAVED_COLUMN_DELETED CHARACTER VARYING DEFAULT '';
	_X RECORD;
	_Y RECORD;
BEGIN
	FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
		_IS_TRUE = (select dc.view from dev.ddl_config dc where dc.table_name = ''||_X.table_name||'');

		IF (_IS_TRUE) THEN
			_HAVED_COLUMN_DELETED = (select (SELECT c.column_name as column from information_schema.columns c where c.table_schema = ''||_SCHEMA||'' and c.table_name = ''||_X.table_name||'' and c.column_name = 'deleted_'||_X.table_name||'')::character varying);

			IF (_HAVED_COLUMN_DELETED = 'deleted_'||_X.table_name||'') THEN
				EXECUTE 'CREATE OR REPLACE VIEW '||_SCHEMA||'.view_'||_X.table_name||' AS SELECT * FROM '||_SCHEMA||'.'||_X.table_name||' t WHERE t.deleted_'||_X.table_name||' = false order by t.id_'||_X.table_name||' desc';
			ELSE 
				EXECUTE 'CREATE OR REPLACE VIEW '||_SCHEMA||'.view_'||_X.table_name||' AS SELECT * FROM '||_SCHEMA||'.'||_X.table_name||' t order by t.id_'||_X.table_name||' desc';
			END IF;
		END IF;
    END LOOP;
	RETURN true;        
END;
$$;


ALTER FUNCTION dev.ddl_create_view(_schema character varying) OWNER TO postgres;

--
-- TOC entry 347 (class 1255 OID 220703)
-- Name: ddl_createall_crud(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.ddl_createall_crud(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_RESPONSE BOOLEAN DEFAULT false;
	_IS_TRUE BOOLEAN DEFAULT false;
	_HANDLER_ATTRIBUTE CHARACTER VARYING DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
		_IS_TRUE = (select dc.crud from dev.ddl_config dc where dc.table_name = ''||_X.table_name||'');
			
		IF (_IS_TRUE) THEN 
			_HANDLER_ATTRIBUTE = (select dc.haved_handler_attribute from dev.ddl_config dc where dc.table_name = ''||_X.table_name||'');
			_RESPONSE = (select dev.ddl_create_crud($1, ''||_X.table_name||'', ''||_HANDLER_ATTRIBUTE||''));
		END IF;
	END LOOP;
	RETURN _RESPONSE;
END;
$_$;


ALTER FUNCTION dev.ddl_createall_crud(_schema character varying) OWNER TO postgres;

--
-- TOC entry 381 (class 1255 OID 220762)
-- Name: dml_create_initial_data(); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.dml_create_initial_data() RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_ID_INITIAL NUMERIC;
	_ID_INITIAL_PROFILE NUMERIC;
	_CURRENT_ID_SETTING NUMERIC;
	_ID_SETTING NUMERIC;
	_CURRENT_ID_COMPANY NUMERIC;
	_ID_COMPANY NUMERIC;
	_CURRENT_ID_ACADEMIC NUMERIC;
	_ID_ACADEMIC NUMERIC;
	_CURRENT_ID_JOB NUMERIC;
	_ID_JOB NUMERIC;
    _CURRENT_ID_PERSON NUMERIC;
    _ID_PERSON NUMERIC;
	_CREATE_NAVIGATION BOOLEAN;
    _CURRENT_ID_PROFILE NUMERIC;
    _CURRENT_ID_PROFILE_TEACHER NUMERIC;
    _CURRENT_ID_PROFILE_STUDENT NUMERIC;
    _ID_PROFILE NUMERIC;
    _ID_PROFILE_TEACHER NUMERIC;
    _ID_PROFILE_STUDENT NUMERIC;
	_CURRENT_ID_PROFILE_NAVIGATION NUMERIC;
	_ID_PROFILE_NAVIGATION NUMERIC;
    _CURRENT_ID_USER NUMERIC;
    _ID_USER NUMERIC;
	_EXCEPTION TEXT DEFAULT 'Internal Error';
	_X RECORD;
BEGIN	
		_CURRENT_ID_SETTING = (select nextval('core.serial_setting')-1);	
		FOR _X IN INSERT INTO core.setting(id_setting, expiration_token, expiration_verification_code, inactivity_time, session_limit, deleted_setting) VALUES (_CURRENT_ID_SETTING, 30000, 30000, 30000, 5, false) RETURNING id_setting LOOP
			_ID_SETTING = _X.id_setting;
		END LOOP;
		
		IF (_ID_SETTING >= 1) THEN
			_CURRENT_ID_COMPANY = (select nextval('core.serial_company')-1);	
			FOR _X IN INSERT INTO core.company(id_company, id_setting, name_company, acronym_company, address_company, status_company, deleted_company) VALUES (_CURRENT_ID_COMPANY, _ID_SETTING, 'UNIDAD EDUCATIVA BILINGÜE TSANTSA', 'UETSANTSA', 'PUYO', true, false) RETURNING id_company LOOP
				_ID_COMPANY = _X.id_company;
			END LOOP;
			
			IF (_ID_COMPANY >= 1) THEN 
				_CURRENT_ID_ACADEMIC = (select nextval('core.serial_academic')-1);	
				FOR _X IN INSERT INTO core.academic(id_academic, title_academic, abbreviation_academic, nivel_academic, deleted_academic) VALUES (_CURRENT_ID_ACADEMIC, 'Titulo Administrador', 'Abreviación titulo', 'Nivel titulo', false) RETURNING id_academic LOOP
					_ID_ACADEMIC = _X.id_academic;
				END LOOP;
				
				IF (_ID_ACADEMIC >= 1) THEN
					_CURRENT_ID_JOB = (select nextval('core.serial_job')-1);	
					
					FOR _X IN INSERT INTO core.job(id_job, name_job, address_job, phone_job, position_job, deleted_job) VALUES (_CURRENT_ID_JOB, 'Empresa', 'Dirección', '+593', 'Cargo', false) RETURNING id_job LOOP
						_ID_JOB = _X.id_job;
					END LOOP;
					
					IF (_ID_JOB >= 1) THEN
						_CURRENT_ID_PERSON = (select nextval('core.serial_person')-1);	
						FOR _X IN INSERT INTO core.person(id_person, id_academic, id_job, dni_person, name_person, last_name_person, address_person, phone_person, deleted_person) VALUES (_CURRENT_ID_PERSON, _ID_ACADEMIC, _ID_JOB, '1600959348', 'EDGAR RENATO', 'VARGAS TANCHIMIA', 'TSURAKU', '+593995486239', false) RETURNING id_person LOOP
							_ID_PERSON = _X.id_person;
						END LOOP;
						
						IF (_ID_PERSON >= 1) THEN
							_CREATE_NAVIGATION = (select * from dev.dml_create_navigation());
							
							IF (_CREATE_NAVIGATION) THEN 
								_CURRENT_ID_PROFILE = (select nextval('core.serial_profile')-1);
								_ID_INITIAL_PROFILE = _CURRENT_ID_PROFILE;

								FOR _X IN INSERT INTO core.profile(id_profile, id_company, type_profile, name_profile, description_profile, status_profile, deleted_profile) VALUES (_CURRENT_ID_PROFILE, _ID_COMPANY, 'administator', 'Perfil Administrador', 'Perfil de usuario para el administrador', true, false) RETURNING id_profile LOOP
									_ID_PROFILE = _X.id_profile;
								END LOOP;

								_CURRENT_ID_PROFILE_TEACHER = (select nextval('core.serial_profile')-1);	

								FOR _X IN INSERT INTO core.profile(id_profile, id_company, type_profile, name_profile, description_profile, status_profile, deleted_profile) VALUES (_CURRENT_ID_PROFILE_TEACHER, _ID_COMPANY, 'commonProfile', 'Perfil Maestro', 'Perfil de usuario para el maestro', true, false) RETURNING id_profile LOOP
									_ID_PROFILE_TEACHER = _X.id_profile;
								END LOOP;

								_CURRENT_ID_PROFILE_STUDENT = (select nextval('core.serial_profile')-1);	

								FOR _X IN INSERT INTO core.profile(id_profile, id_company, type_profile, name_profile, description_profile, status_profile, deleted_profile) VALUES (_CURRENT_ID_PROFILE_STUDENT, _ID_COMPANY, 'commonProfile', 'Perfil Estudiante', 'Perfil de usuario para el estudiante', true, false) RETURNING id_profile LOOP
									_ID_PROFILE_STUDENT = _X.id_profile;
								END LOOP;
								
								IF (_ID_PROFILE >= 1) THEN
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									_ID_INITIAL = _CURRENT_ID_PROFILE_NAVIGATION;
									
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE, 1) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;
									
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE, 2) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;
									
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE, 3) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;
									
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE, 4) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									-- TEACHER
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_TEACHER, 5) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_TEACHER, 6) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_TEACHER, 7) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_TEACHER, 8) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									-- STUDENT
									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_STUDENT, 9) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_STUDENT, 10) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_STUDENT, 11) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_PROFILE_NAVIGATION = (select nextval('core.serial_profile_navigation')-1);
									FOR _X IN INSERT INTO core.profile_navigation(id_profile_navigation, id_profile, id_navigation) VALUES (_CURRENT_ID_PROFILE_NAVIGATION, _ID_PROFILE_STUDENT, 12) RETURNING id_profile_navigation LOOP
										_ID_PROFILE_NAVIGATION = _X.id_profile_navigation;
									END LOOP;

									_CURRENT_ID_USER = (select nextval('core.serial_user')-1);
									FOR _X IN INSERT INTO core.user(id_user, id_company, id_person, id_profile, type_user, name_user, password_user, avatar_user, status_user, deleted_user) VALUES (_CURRENT_ID_USER, _ID_COMPANY, _ID_PERSON, _ID_PROFILE, 'teacher', 'tsantsa.edu@gmail.com', 'uOuuMWQb8Ll7Kj9QkunbTg==', 'default.svg', true, false) RETURNING id_user LOOP
										_ID_USER = _X.id_user;
									END LOOP;
									
									IF (_ID_USER >= 1) THEN
										RETURN true;
									ELSE
										_EXCEPTION = 'Ocurrió un error al ingresar el usuario';
										RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
									END IF;
								ELSE
									_EXCEPTION = 'Ocurrió un error al ingresar el perfil de usuario';
									RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
								END IF;
							ELSE
								_EXCEPTION = 'Ocurrió un error al ingresar la navegación';
								RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
							END IF;
						ELSE
							_EXCEPTION = 'Ocurrió un error al ingresar la persona';
							RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
						END IF;
					ELSE
						_EXCEPTION = 'Ocurrió un error al ingresar la información laboral';
						RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
					END IF;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar la información académica';
					RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
				END IF;
			ELSE
				_EXCEPTION = 'Ocurrió un error al ingresar la empresa';
				RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
			END IF;
		ELSE
			_EXCEPTION = 'Ocurrió un error al ingresar la configuración';
			RAISE EXCEPTION '%',_EXCEPTION USING DETAIL = '_database';
		END IF;
		
		exception when others then 
				-- RAISE NOTICE '%', SQLERRM;
				IF (_CURRENT_ID_SETTING >= 1) THEN 
					EXECUTE 'select setval(''core.serial_setting'', '||_CURRENT_ID_SETTING||')';
				END IF;
				IF (_CURRENT_ID_COMPANY >= 1) THEN 
					EXECUTE 'select setval(''core.serial_company'', '||_CURRENT_ID_COMPANY||')';
				END IF;
				IF (_CURRENT_ID_ACADEMIC >= 1) THEN 
					EXECUTE 'select setval(''core.serial_academic'', '||_CURRENT_ID_ACADEMIC||')';
				END IF;
				IF (_CURRENT_ID_JOB >= 1) THEN 
					EXECUTE 'select setval(''core.serial_job'', '||_CURRENT_ID_JOB||')';
				END IF;
				IF (_CURRENT_ID_PERSON >= 1) THEN 
					EXECUTE 'select setval(''core.serial_person'', '||_CURRENT_ID_PERSON||')';
				END IF;
				IF (_ID_INITIAL_PROFILE >= 1) THEN 
					EXECUTE 'select setval(''core.serial_profile'', '||_ID_INITIAL_PROFILE||')';
				END IF;
				IF (_ID_INITIAL >= 1) THEN 
					EXECUTE 'select setval(''core.serial_profile_navigation'', '||_ID_INITIAL||')';
				END IF;
				IF (_CURRENT_ID_USER >= 1) THEN 
					EXECUTE 'select setval(''core.serial_user'', '||_CURRENT_ID_USER||')';
				END IF;
				RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
END;
$$;


ALTER FUNCTION dev.dml_create_initial_data() OWNER TO postgres;

--
-- TOC entry 380 (class 1255 OID 220760)
-- Name: dml_create_navigation(); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.dml_create_navigation() RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_ID_INITIAL NUMERIC;
	_CURRENT_ID_NAVIGATION NUMERIC;
	_RESPONSE1 NUMERIC DEFAULT 0;
	_RESPONSE2 NUMERIC DEFAULT 0;
	_RESPONSE3 NUMERIC DEFAULT 0;
	_RESPONSE4 NUMERIC DEFAULT 0;

	_RESPONSE5 NUMERIC DEFAULT 0;
	_RESPONSE6 NUMERIC DEFAULT 0;
	_RESPONSE7 NUMERIC DEFAULT 0;
	_RESPONSE8 NUMERIC DEFAULT 0;

	_RESPONSE9 NUMERIC DEFAULT 0;
	_RESPONSE10 NUMERIC DEFAULT 0;
	_RESPONSE11 NUMERIC DEFAULT 0;
	_RESPONSE12 NUMERIC DEFAULT 0;


	_X RECORD;
BEGIN
		-- Administrador (Por defecto)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		_ID_INITIAL = _CURRENT_ID_NAVIGATION;
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Administrador (Por defecto)', 'Navegación por defecto para el administrador', 'defaultNavigation', true, '[
	{
		"id": "core",
		"title": "Administración",
		"subtitle": "Administración core del sistema",
		"type": "group",
		"icon": "heroicons_outline:chip",
		"children": [
			{
				"id": "core.company",
				"title": "Institución",
				"type": "basic",
				"icon": "heroicons_outline:office-building",
				"link": "/core/company"
			},
			{
				"id": "core.validation",
				"title": "Validaciones",
				"type": "basic",
				"icon": "mat_outline:security",
				"link": "/core/validation"
			},
			{
				"id": "core.navigation",
				"title": "Navegación",
				"type": "basic",
				"icon": "heroicons_outline:template",
				"link": "/core/navigation"
			},
			{
				"id": "core.profile",
				"title": "Perfil",
				"type": "basic",
				"icon": "heroicons_outline:user-group",
				"link": "/core/profile"
			},
			{
				"id": "core.user",
				"title": "Usuario",
				"type": "basic",
				"icon": "heroicons_outline:user",
				"link": "/core/user"
			},
			{
				"id": "core.session",
				"title": "Sesiones",
				"type": "basic",
				"icon": "heroicons_outline:login",
				"link": "/core/session"
			},
			{
				"id": "core.system-event",
				"title": "Eventos del sistema",
				"type": "basic",
				"icon": "mat_outline:event",
				"link": "/core/system-event"
			}
		]
	},
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.period",
				"title": "Periodos",
				"type": "basic",
				"icon": "mat_outline:timeline",
				"link": "/business/period"
			},
			{
				"id": "business.career",
				"title": "Cursos",
				"type": "basic",
				"icon": "mat_outline:account_tree",
				"link": "/business/career"
			},
			{
				"id": "business.course",
				"title": "Asignaturas",
				"type": "basic",
				"icon": "heroicons_outline:academic-cap",
				"link": "/business/course"
			}
		]
	},
	{
		"id": "report",
		"title": "Reportes",
		"subtitle": "Reportes del sistema",
		"type": "basic",
		"link": "/report"
	}
]', false) returning id_navigation LOOP
			_RESPONSE1 = _X.id_navigation;
		END LOOP;
		
		
		-- Administrador (Compacta)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Administrador (Compacta)', 'Navegación compacta para el administrador', 'compactNavigation',  true, '[
  {
    "id": "core",
    "title": "Administración",
    "type": "aside",
    "icon": "heroicons_outline:chip",
    "children": []
  },
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  },
  {
    "id": "report",
    "title": "Reportes",
    "type": "basic",
    "icon": "heroicons_outline:document-report",
    "link": "/report"
  }
]', false) returning id_navigation LOOP
			_RESPONSE2 = _X.id_navigation;
		END LOOP;
		
		
		-- Administrador (Futurista)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Administrador (Futurista)', 'Navegación futurista para el administrador', 'futuristicNavigation',  true, '[
	{
		"id": "core",
		"title": "Administración",
		"subtitle": "Administración core del sistema",
		"type": "group",
		"icon": "heroicons_outline:chip",
		"children": [
			{
				"id": "core.company",
				"title": "Institución",
				"type": "basic",
				"icon": "heroicons_outline:office-building",
				"link": "/core/company"
			},
			{
				"id": "core.validation",
				"title": "Validaciones",
				"type": "basic",
				"icon": "mat_outline:security",
				"link": "/core/validation"
			},
			{
				"id": "core.navigation",
				"title": "Navegación",
				"type": "basic",
				"icon": "heroicons_outline:template",
				"link": "/core/navigation"
			},
			{
				"id": "core.profile",
				"title": "Perfil",
				"type": "basic",
				"icon": "heroicons_outline:user-group",
				"link": "/core/profile"
			},
			{
				"id": "core.user",
				"title": "Usuario",
				"type": "basic",
				"icon": "heroicons_outline:user",
				"link": "/core/user"
			},
			{
				"id": "core.session",
				"title": "Sesiones",
				"type": "basic",
				"icon": "heroicons_outline:login",
				"link": "/core/session"
			},
			{
				"id": "core.system-event",
				"title": "Eventos del sistema",
				"type": "basic",
				"icon": "mat_outline:event",
				"link": "/core/system-event"
			}
		]
	},
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.period",
				"title": "Periodos",
				"type": "basic",
				"icon": "mat_outline:timeline",
				"link": "/business/period"
			},
			{
				"id": "business.career",
				"title": "Cursos",
				"type": "basic",
				"icon": "mat_outline:account_tree",
				"link": "/business/career"
			},
			{
				"id": "business.course",
				"title": "Asignaturas",
				"type": "basic",
				"icon": "heroicons_outline:academic-cap",
				"link": "/business/course"
			}
		]
	},
	{
		"id": "report",
		"title": "Reportes",
		"subtitle": "Reportes del sistema",
		"type": "basic",
		"link": "/report"
	}
]', false) returning id_navigation LOOP
			_RESPONSE3 = _X.id_navigation;
		END LOOP;
		
		
		-- Administrador (Horizontal)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Administrador (Horizontal)', 'Navegación horizontal para el administrador', 'horizontalNavigation', true, '[
  {
    "id": "core",
    "title": "Administración",
    "type": "aside",
    "icon": "heroicons_outline:chip",
    "children": []
  },
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  },
  {
    "id": "report",
    "title": "Reportes",
    "type": "basic",
    "icon": "heroicons_outline:document-report",
    "link": "/report"
  }
]', false) returning id_navigation LOOP
			_RESPONSE4 = _X.id_navigation;
		END LOOP;
		
		-- Maestro (Por defecto)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		_ID_INITIAL = _CURRENT_ID_NAVIGATION;
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Maestro (Por defecto)', 'Navegación por defecto para el maestro', 'defaultNavigation', true, '[
	{
		"id": "core",
		"title": "Administración",
		"subtitle": "Administración core del sistema",
		"type": "group",
		"icon": "heroicons_outline:chip",
		"children": [
			{
				"id": "core.user",
				"title": "Usuario",
				"type": "basic",
				"icon": "heroicons_outline:user",
				"link": "/core/user"
			}
		]
	},
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.period",
				"title": "Periodos",
				"type": "basic",
				"icon": "mat_outline:timeline",
				"link": "/business/period"
			},
			{
				"id": "business.career",
				"title": "Cursos",
				"type": "basic",
				"icon": "mat_outline:account_tree",
				"link": "/business/career"
			},
			{
				"id": "business.course",
				"title": "Asignaturas",
				"type": "basic",
				"icon": "heroicons_outline:academic-cap",
				"link": "/business/course"
			},
			{
				"id": "business.task",
				"title": "Tareas",
				"type": "basic",
				"icon": "heroicons_outline:book-open",
				"link": "/business/task"
			},
			{
				"id": "business.user-task",
				"title": "Mis tareas",
				"type": "basic",
				"icon": "mat_outline:auto_stories",
				"link": "/business/user-task"
			}
		]
	},
	{
		"id": "report",
		"title": "Reportes",
		"subtitle": "Reportes del sistema",
		"type": "basic",
		"link": "/report"
	}
]', false) returning id_navigation LOOP
			_RESPONSE5 = _X.id_navigation;
		END LOOP;
		
		
		-- Maestro (Compacta)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Maestro (Compacta)', 'Navegación compacta para el maestro', 'compactNavigation',  true, '[
  {
    "id": "core",
    "title": "Administración",
    "type": "aside",
    "icon": "heroicons_outline:chip",
    "children": []
  },
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  },
  {
    "id": "report",
    "title": "Reportes",
    "type": "basic",
    "icon": "heroicons_outline:document-report",
    "link": "/report"
  }
]', false) returning id_navigation LOOP
			_RESPONSE6 = _X.id_navigation;
		END LOOP;
		
		
		-- Maestro (Futurista)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Maestro (Futurista)', 'Navegación futurista para el maestro', 'futuristicNavigation',  true, '[
	{
		"id": "core",
		"title": "Administración",
		"subtitle": "Administración core del sistema",
		"type": "group",
		"icon": "heroicons_outline:chip",
		"children": [
			{
				"id": "core.user",
				"title": "Usuario",
				"type": "basic",
				"icon": "heroicons_outline:user",
				"link": "/core/user"
			}
		]
	},
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.period",
				"title": "Periodos",
				"type": "basic",
				"icon": "mat_outline:timeline",
				"link": "/business/period"
			},
			{
				"id": "business.career",
				"title": "Cursos",
				"type": "basic",
				"icon": "mat_outline:account_tree",
				"link": "/business/career"
			},
			{
				"id": "business.course",
				"title": "Asignaturas",
				"type": "basic",
				"icon": "heroicons_outline:academic-cap",
				"link": "/business/course"
			},
			{
				"id": "business.task",
				"title": "Tareas",
				"type": "basic",
				"icon": "heroicons_outline:book-open",
				"link": "/business/task"
			},
			{
				"id": "business.user-task",
				"title": "Mis tareas",
				"type": "basic",
				"icon": "mat_outline:auto_stories",
				"link": "/business/user-task"
			}
		]
	},
	{
		"id": "report",
		"title": "Reportes",
		"subtitle": "Reportes del sistema",
		"type": "basic",
		"link": "/report"
	}
]', false) returning id_navigation LOOP
			_RESPONSE7 = _X.id_navigation;
		END LOOP;
		
		
		-- Maestro (Horizontal)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Maestro (Horizontal)', 'Navegación horizontal para el maestro', 'horizontalNavigation', true, '[
  {
    "id": "core",
    "title": "Administración",
    "type": "aside",
    "icon": "heroicons_outline:chip",
    "children": []
  },
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  },
  {
    "id": "report",
    "title": "Reportes",
    "type": "basic",
    "icon": "heroicons_outline:document-report",
    "link": "/report"
  }
]', false) returning id_navigation LOOP
			_RESPONSE8 = _X.id_navigation;
		END LOOP;

		-- Estudiante (Por defecto)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		_ID_INITIAL = _CURRENT_ID_NAVIGATION;
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Estudiante (Por defecto)', 'Navegación por defecto para el estudiante', 'defaultNavigation', true, '[
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.my-courses",
				"title": "Mis asignaturas",
				"type": "basic",
				"icon": "mat_outline:ballot",
				"link": "/business/my-courses"
			},
			{
				"id": "business.user-task",
				"title": "Mis tareas",
				"type": "basic",
				"icon": "mat_outline:auto_stories",
				"link": "/business/user-task"
			},
			{
				"id": "business.assistance",
				"title": "Mis asistencias",
				"type": "basic",
				"icon": "mat_solid:blur_linear",
				"link": "/business/assistance"
			}
		]
	}
]', false) returning id_navigation LOOP
			_RESPONSE9 = _X.id_navigation;
		END LOOP;
		
		
		-- Estudiante (Compacta)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Estudiante (Compacta)', 'Navegación compacta para el estudiante', 'compactNavigation',  true, '[
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  }
]', false) returning id_navigation LOOP
			_RESPONSE10 = _X.id_navigation;
		END LOOP;
		
		
		-- Estudiante (Futurista)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Estudiante (Futurista)', 'Navegación futurista para el estudiante', 'futuristicNavigation',  true, '[
	{
		"id": "business",
		"title": "Académico",
		"subtitle": "Administración académica del sistema",
		"type": "group",
		"icon": "heroicons_outline:cube-transparent",
		"children": [
			{
				"id": "business.home",
				"title": "Inicio",
				"type": "basic",
				"icon": "heroicons_outline:home",
				"link": "/business/home"
			},
			{
				"id": "business.my-courses",
				"title": "Mis asignaturas",
				"type": "basic",
				"icon": "mat_outline:ballot",
				"link": "/business/my-courses"
			},
			{
				"id": "business.user-task",
				"title": "Mis tareas",
				"type": "basic",
				"icon": "mat_outline:auto_stories",
				"link": "/business/user-task"
			},
			{
				"id": "business.assistance",
				"title": "Mis asistencias",
				"type": "basic",
				"icon": "mat_solid:blur_linear",
				"link": "/business/assistance"
			}
		]
	}
]', false) returning id_navigation LOOP
			_RESPONSE11 = _X.id_navigation;
		END LOOP;
		
		
		-- Estudiante (Horizontal)
		_CURRENT_ID_NAVIGATION = (select nextval('core.serial_navigation')-1);	
		FOR _X IN INSERT INTO core.navigation(
			id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation)
			VALUES (_CURRENT_ID_NAVIGATION, 1, 'Estudiante (Horizontal)', 'Navegación horizontal para el estudiante', 'horizontalNavigation', true, '[
  {
    "id": "business",
    "title": "Académico",
    "type": "aside",
    "icon": "mat_outline:business",
    "children": []
  }
]', false) returning id_navigation LOOP
			_RESPONSE12 = _X.id_navigation;
		END LOOP;

		IF (_RESPONSE1 >= 1 AND _RESPONSE2 >= 1 AND _RESPONSE3 >=1 AND _RESPONSE4 >= 1 AND _RESPONSE5 >= 1 AND _RESPONSE6 >= 1 AND _RESPONSE7 >=1 AND _RESPONSE8 >= 1 AND _RESPONSE9 >= 1 AND _RESPONSE10 >= 1 AND _RESPONSE11 >=1 AND _RESPONSE12 >= 1) THEN
			RETURN true;
		ELSE
			RETURN false;
		END IF;
		exception when others then 
				-- RAISE NOTICE '%', SQLERRM;
				IF (_ID_INITIAL >= 1) THEN
					EXECUTE 'select setval(''core.serial_navigation'', '||_ID_INITIAL||')';
				END IF;
				RAISE EXCEPTION '%',SQLERRM USING DETAIL = '_database';
END;
$$;


ALTER FUNCTION dev.dml_create_navigation() OWNER TO postgres;

--
-- TOC entry 348 (class 1255 OID 220704)
-- Name: dml_reset_sequences(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.dml_reset_sequences(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
	_EXIST BOOLEAN DEFAULT false;
	_X RECORD;
BEGIN
	FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'') LOOP
		_EXIST = (select true from information_schema.sequences s where s.sequence_name = 'serial_'||_X.table_name||'');
		IF (_EXIST) THEN 
			EXECUTE 'SELECT setval('''||_SCHEMA||'.serial_'||_X.table_name||''', 1)';
		END IF;
	END LOOP;
    RETURN true;        
END;
$$;


ALTER FUNCTION dev.dml_reset_sequences(_schema character varying) OWNER TO postgres;

--
-- TOC entry 349 (class 1255 OID 220705)
-- Name: dml_truncateall(character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.dml_truncateall(_schema character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_X RECORD;
BEGIN
        FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
			EXECUTE 'TRUNCATE TABLE '||$1||'.'||_X.table_name||' CASCADE';
        END LOOP;
        RETURN true;
END;
$_$;


ALTER FUNCTION dev.dml_truncateall(_schema character varying) OWNER TO postgres;

--
-- TOC entry 339 (class 1255 OID 220696)
-- Name: utils_generate_external_id_validation(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_generate_external_id_validation(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_ID CHARACTER VARYING;
	_NAME_TABLE CHARACTER VARYING;
	_SCHEMA_TABLE CHARACTER VARYING;
	_EXTERNAL_ID_VALIDATION TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_ID = (select substring(_X.column_name from 1 for 3));
		_NAME_TABLE = (select substring(_X.column_name from 4 for (char_length(_X.column_name))));
		_SCHEMA_TABLE = (SELECT t.table_schema FROM information_schema.tables t WHERE t.table_name = _NAME_TABLE);
			
		IF ((select substring(_X.column_name from 1 for 3)) = 'id_' and (select substring(_X.column_name from 4 for (char_length(_X.column_name)))) != _table_name) THEN
			_EXTERNAL_ID_VALIDATION = ''||_EXTERNAL_ID_VALIDATION||' 
			-- '||_NAME_TABLE||'
			_COUNT_EXTERNALS_IDS = (select count(*) from '||_SCHEMA_TABLE||'.view_'||_NAME_TABLE||' v where v.id_'||_NAME_TABLE||' = _id_'||_NAME_TABLE||');
				
			IF (_COUNT_EXTERNALS_IDS = 0) THEN
				_EXCEPTION = ''''El id ''''||_id_'||_NAME_TABLE||'||'''' de la tabla '||_NAME_TABLE||' no se encuentra registrado'''';
				RAISE EXCEPTION ''''%'''',_EXCEPTION USING DETAIL = ''''_database'''';
			END IF;
			';
		END IF;
	END LOOP;
	return _EXTERNAL_ID_VALIDATION;
END;
$_$;


ALTER FUNCTION dev.utils_generate_external_id_validation(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 297 (class 1255 OID 220685)
-- Name: utils_get_columns(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_columns(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_COLUMNS TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS = ''||_COLUMNS||' '||_X.column_name||',';
	END LOOP;
	return (select substring(_COLUMNS from 2 for (char_length(_COLUMNS)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_columns(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 300 (class 1255 OID 220686)
-- Name: utils_get_columns_alias(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_columns_alias(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_COLUMNS_ALIAS TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS_ALIAS = ''||_COLUMNS_ALIAS||' t.'||_X.column_name||',';
	END LOOP;
	return (select substring(_COLUMNS_ALIAS from 2 for (char_length(_COLUMNS_ALIAS)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_columns_alias(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 302 (class 1255 OID 220688)
-- Name: utils_get_columns_backend(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_columns_backend(_schema character varying, _table_name character varying) RETURNS TABLE(column_name_ character varying, column_type_ character varying, length_character_ numeric, lenght_numeric_ numeric)
    LANGUAGE plpgsql
    AS $_$
DECLARE
BEGIN
		RETURN QUERY SELECT cast(c.column_name as character varying), cast(c.data_type as character varying), cast(c.character_maximum_length as numeric), cast(c.numeric_precision as numeric) FROM information_schema.columns c WHERE c.table_schema = ''||$1||'' and c.table_name = ''||$2||'' order by c.ordinal_position asc; 
END;
$_$;


ALTER FUNCTION dev.utils_get_columns_backend(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 301 (class 1255 OID 220687)
-- Name: utils_get_columns_type(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_columns_type(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_COLUMNS_TYPE TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS_TYPE = ''||_COLUMNS_TYPE||' '||_X.column_name||' '||_X.data_type||',';
	END LOOP;
	return (select substring(_COLUMNS_TYPE from 2 for (char_length(_COLUMNS_TYPE)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_columns_type(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 303 (class 1255 OID 220689)
-- Name: utils_get_param_delete(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_param_delete(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_PARAM_DELETE TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' and c.ordinal_position = 1'  LOOP
		_PARAM_DELETE = ''||_PARAM_DELETE||' _'||UPPER(_X.column_name)||' '||_X.data_type||',';
    END LOOP;
	return (select substring(_PARAM_DELETE from 2 for (char_length(_PARAM_DELETE)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_param_delete(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 321 (class 1255 OID 220690)
-- Name: utils_get_params(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_params(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_PARAMS TEXT DEFAULT '';
	_X RECORD;	
BEGIN
     FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type, c.udt_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		IF (_X.data_type = 'USER-DEFINED') THEN
			_PARAMS = ''||_PARAMS||' _'||UPPER(_X.column_name)||' '||$1||'."'||_X.udt_name||'",';
		ELSE
			_PARAMS = ''||_PARAMS||' _'||UPPER(_X.column_name)||' '||_X.data_type||',';
		END IF;
     END LOOP;
	return (select substring(_PARAMS from 2 for (char_length(_PARAMS)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_params(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 322 (class 1255 OID 220691)
-- Name: utils_get_params_exclude_id(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_params_exclude_id(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_PARAMS TEXT DEFAULT '';
	_X RECORD;
BEGIN
     FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type, c.udt_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' and c.ordinal_position != 1 order by c.ordinal_position asc'  LOOP
		IF (_X.data_type = 'USER-DEFINED') THEN
			_PARAMS = ''||_PARAMS||' _'||UPPER(_X.column_name)||' '||$1||'."'||_X.udt_name||'",';
		ELSE
			_PARAMS = ''||_PARAMS||' _'||UPPER(_X.column_name)||' '||_X.data_type||',';
		END IF;
     END LOOP;
	return (select substring(_PARAMS from 2 for (char_length(_PARAMS)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_params_exclude_id(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 323 (class 1255 OID 220692)
-- Name: utils_get_query_update(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_query_update(_schema character varying, _table_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_QUERY_TO_UPDATE TEXT DEFAULT '';
	_ID_TABLE TEXT DEFAULT '';
	_RESULT_QUERY TEXT DEFAULT '';
	_X RECORD;
BEGIN
    FOR _X IN EXECUTE 'SELECT c.column_name, c.ordinal_position FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		IF (_X.ordinal_position != 1) THEN 
			_QUERY_TO_UPDATE = ''||_QUERY_TO_UPDATE||' '||_X.column_name||'=$'||(_X.ordinal_position)+1||',';
		END IF;
		IF (_X.ordinal_position = 1) THEN 
			_ID_TABLE = ''||_ID_TABLE||' '||_X.column_name||'=$'||(_X.ordinal_position)+1||',';
		END IF;
    END LOOP;

	_QUERY_TO_UPDATE = (select substring(_QUERY_TO_UPDATE from 2 for (char_length(_QUERY_TO_UPDATE)-2)));
	_ID_TABLE = (select substring(_ID_TABLE from 2 for (char_length(_ID_TABLE)-2)));

	RETURN 'SET '||_QUERY_TO_UPDATE||' WHERE '||_ID_TABLE||'';
END;
$_$;


ALTER FUNCTION dev.utils_get_query_update(_schema character varying, _table_name character varying) OWNER TO postgres;

--
-- TOC entry 336 (class 1255 OID 220693)
-- Name: utils_get_values_insert(character varying, character varying, numeric); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_get_values_insert(_schema character varying, _table_name character varying, _increment numeric) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_VALUES_INSERT TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.ordinal_position FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' and c.ordinal_position != 1 order by c.ordinal_position asc'  LOOP
		_VALUES_INSERT = ''||_VALUES_INSERT||' $'||(_X.ordinal_position)- $3||' ,';
    END LOOP;
	return (select substring(_VALUES_INSERT from 2 for (char_length(_VALUES_INSERT)-2)));
END;
$_$;


ALTER FUNCTION dev.utils_get_values_insert(_schema character varying, _table_name character varying, _increment numeric) OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 220684)
-- Name: utils_limit_number(numeric); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_limit_number(digitos numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
DECLARE
	_NUMBER_CHARACTER TEXT DEFAULT '';
	_X RECORD;
	
BEGIN
	FOR _X IN 1..$1 LOOP
		_NUMBER_CHARACTER = ''||_NUMBER_CHARACTER||'9';
    END LOOP;
	return _NUMBER_CHARACTER::numeric;
END;
$_$;


ALTER FUNCTION dev.utils_limit_number(digitos numeric) OWNER TO postgres;

--
-- TOC entry 337 (class 1255 OID 220694)
-- Name: utils_table_exists(character varying, character varying); Type: FUNCTION; Schema: dev; Owner: postgres
--

CREATE FUNCTION dev.utils_table_exists(_schema character varying, _table_name character varying) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
DECLARE
BEGIN
	return (SELECT count(*) FROM information_schema.tables t WHERE t.table_type = 'BASE TABLE' and t.table_schema = ''||$1||'' and t.table_name = ''||$2||'');
END;
$_$;


ALTER FUNCTION dev.utils_table_exists(_schema character varying, _table_name character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 220471)
-- Name: assistance; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.assistance (
    id_assistance numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    id_course numeric(10,0) NOT NULL,
    start_marking_date timestamp without time zone,
    end_marking_date timestamp without time zone,
    is_late boolean
);


ALTER TABLE business.assistance OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 220463)
-- Name: attached; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.attached (
    id_attached numeric(10,0) NOT NULL,
    id_user_task numeric(10,0) NOT NULL,
    file_name character varying(250),
    length_mb character varying(10),
    extension character varying(10),
    server_path character varying(250),
    upload_date timestamp without time zone
);


ALTER TABLE business.attached OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 220423)
-- Name: career; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.career (
    id_career numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    name_career character varying(100),
    description_career character varying(1000),
    status_career boolean,
    creation_date_career timestamp without time zone,
    deleted_career boolean
);


ALTER TABLE business.career OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 220476)
-- Name: comment; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.comment (
    id_comment numeric(10,0) NOT NULL,
    id_user_task numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    value_comment character varying(250),
    date_comment timestamp without time zone,
    deleted_comment boolean
);


ALTER TABLE business.comment OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 220504)
-- Name: comment_forum; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.comment_forum (
    id_comment_forum numeric(10,0) NOT NULL,
    id_forum numeric(5,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    value_comment_forum character varying(250),
    date_comment_forum timestamp with time zone,
    deleted_comment_forum boolean
);


ALTER TABLE business.comment_forum OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 220415)
-- Name: course; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.course (
    id_course numeric(10,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    id_period numeric(5,0) NOT NULL,
    id_career numeric(5,0) NOT NULL,
    id_schedule numeric(10,0) NOT NULL,
    name_course character varying(250),
    description_course character varying(250),
    status_course boolean,
    creation_date_course timestamp without time zone,
    deleted_course boolean
);


ALTER TABLE business.course OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 220431)
-- Name: enrollment; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.enrollment (
    id_enrollment numeric(10,0) NOT NULL,
    id_course numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    date_enrollment timestamp without time zone,
    status_enrollment boolean,
    completed_course boolean,
    deleted_enrollment boolean
);


ALTER TABLE business.enrollment OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 220499)
-- Name: forum; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.forum (
    id_forum numeric(5,0) NOT NULL,
    id_course numeric(5,0) NOT NULL,
    title_forum character varying(100),
    description_forum character varying(250),
    date_forum timestamp with time zone,
    deleted_forum boolean
);


ALTER TABLE business.forum OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 220509)
-- Name: glossary; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.glossary (
    id_glossary numeric(5,0) NOT NULL,
    id_course numeric(5,0) NOT NULL,
    term_glossary character varying(100),
    concept_glossary character varying(250),
    date_glossary timestamp with time zone,
    deleted_glossary boolean
);


ALTER TABLE business.glossary OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 220514)
-- Name: newsletter; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.newsletter (
    id_newsletter numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    name_newsletter character varying(100),
    description_newsletter character varying(100),
    date_newsletter timestamp with time zone,
    deleted boolean
);


ALTER TABLE business.newsletter OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 220486)
-- Name: partial; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.partial (
    id_partial numeric(5,0) NOT NULL,
    id_quimester numeric(5,0) NOT NULL,
    name_partial character varying(100),
    description_partial character varying(250),
    deleted_partial boolean
);


ALTER TABLE business.partial OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 220410)
-- Name: period; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.period (
    id_period numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    name_period character varying(100),
    description_period character varying(250),
    start_date_period timestamp without time zone,
    end_date_period timestamp without time zone,
    maximum_rating numeric(3,0),
    approval_note_period numeric(3,0),
    deleted_period boolean
);


ALTER TABLE business.period OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 220481)
-- Name: quimester; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.quimester (
    id_quimester numeric(5,0) NOT NULL,
    id_period numeric(5,0) NOT NULL,
    name_quimester character varying(100),
    description_quimester character varying(250),
    deleted_quimester boolean
);


ALTER TABLE business.quimester OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 220446)
-- Name: resource; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.resource (
    id_resource numeric(10,0) NOT NULL,
    id_task numeric(10,0) NOT NULL,
    name_resource character varying(100),
    description_resource character varying(250),
    link_resource character varying(500),
    deleted_resource boolean
);


ALTER TABLE business.resource OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 220491)
-- Name: resource_course; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.resource_course (
    id_resource_course numeric(5,0) NOT NULL,
    id_course numeric(5,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    file_name character varying(250),
    length_mb character varying(10),
    extension character varying(10),
    server_path character varying(250),
    upload_date timestamp with time zone
);


ALTER TABLE business.resource_course OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 220436)
-- Name: schedule; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.schedule (
    id_schedule numeric(10,0) NOT NULL,
    start_date_schedule time without time zone,
    end_date_schedule time without time zone,
    tolerance_schedule numeric(4,0),
    creation_date_schedule timestamp without time zone,
    deleted_schedule boolean
);


ALTER TABLE business.schedule OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 220994)
-- Name: serial_assistance; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_assistance
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_assistance OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 221012)
-- Name: serial_attached; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_attached
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_attached OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 220986)
-- Name: serial_career; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_career
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_career OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 221014)
-- Name: serial_comment; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_comment
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_comment OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 221010)
-- Name: serial_comment_forum; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_comment_forum
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_comment_forum OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 220984)
-- Name: serial_course; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_course
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_course OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 220988)
-- Name: serial_enrollment; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_enrollment
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_enrollment OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 221000)
-- Name: serial_forum; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_forum
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_forum OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 221002)
-- Name: serial_glossary; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_glossary
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_glossary OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 220990)
-- Name: serial_newsletter; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_newsletter
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_newsletter OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 221008)
-- Name: serial_partial; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_partial
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_partial OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 220982)
-- Name: serial_period; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_period
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_period OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 220996)
-- Name: serial_quimester; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_quimester
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_quimester OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 221004)
-- Name: serial_resource; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_resource
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_resource OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 220998)
-- Name: serial_resource_course; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_resource_course
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE business.serial_resource_course OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 220980)
-- Name: serial_schedule; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_schedule
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_schedule OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 220992)
-- Name: serial_task; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_task
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_task OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 221006)
-- Name: serial_user_task; Type: SEQUENCE; Schema: business; Owner: postgres
--

CREATE SEQUENCE business.serial_user_task
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE business.serial_user_task OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 220441)
-- Name: task; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.task (
    id_task numeric(10,0) NOT NULL,
    id_course numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    id_partial numeric(5,0),
    name_task character varying(100),
    description_task character varying(250),
    status_task boolean,
    creation_date_task timestamp without time zone,
    limit_date timestamp without time zone,
    deleted_task boolean
);


ALTER TABLE business.task OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 220454)
-- Name: user_task; Type: TABLE; Schema: business; Owner: postgres
--

CREATE TABLE business.user_task (
    id_user_task numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    id_task numeric(10,0) NOT NULL,
    response_user_task character varying(500),
    shipping_date_user_task timestamp without time zone,
    qualification_user_task numeric(3,0) DEFAULT 0 NOT NULL,
    is_open boolean,
    is_dispatched boolean,
    is_qualified boolean
);


ALTER TABLE business.user_task OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 221044)
-- Name: view_assistance; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_assistance AS
 SELECT t.id_assistance,
    t.id_user,
    t.id_course,
    t.start_marking_date,
    t.end_marking_date,
    t.is_late
   FROM business.assistance t
  ORDER BY t.id_assistance DESC;


ALTER TABLE business.view_assistance OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 221080)
-- Name: view_attached; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_attached AS
 SELECT t.id_attached,
    t.id_user_task,
    t.file_name,
    t.length_mb,
    t.extension,
    t.server_path,
    t.upload_date
   FROM business.attached t
  ORDER BY t.id_attached DESC;


ALTER TABLE business.view_attached OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 221028)
-- Name: view_career; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_career AS
 SELECT t.id_career,
    t.id_company,
    t.name_career,
    t.description_career,
    t.status_career,
    t.creation_date_career,
    t.deleted_career
   FROM business.career t
  WHERE (t.deleted_career = false)
  ORDER BY t.id_career DESC;


ALTER TABLE business.view_career OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 221084)
-- Name: view_comment; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_comment AS
 SELECT t.id_comment,
    t.id_user_task,
    t.id_user,
    t.value_comment,
    t.date_comment,
    t.deleted_comment
   FROM business.comment t
  WHERE (t.deleted_comment = false)
  ORDER BY t.id_comment DESC;


ALTER TABLE business.view_comment OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 221076)
-- Name: view_comment_forum; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_comment_forum AS
 SELECT t.id_comment_forum,
    t.id_forum,
    t.id_user,
    t.value_comment_forum,
    t.date_comment_forum,
    t.deleted_comment_forum
   FROM business.comment_forum t
  WHERE (t.deleted_comment_forum = false)
  ORDER BY t.id_comment_forum DESC;


ALTER TABLE business.view_comment_forum OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 221024)
-- Name: view_course; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_course AS
 SELECT t.id_course,
    t.id_company,
    t.id_period,
    t.id_career,
    t.id_schedule,
    t.name_course,
    t.description_course,
    t.status_course,
    t.creation_date_course,
    t.deleted_course
   FROM business.course t
  WHERE (t.deleted_course = false)
  ORDER BY t.id_course DESC;


ALTER TABLE business.view_course OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 221032)
-- Name: view_enrollment; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_enrollment AS
 SELECT t.id_enrollment,
    t.id_course,
    t.id_user,
    t.date_enrollment,
    t.status_enrollment,
    t.completed_course,
    t.deleted_enrollment
   FROM business.enrollment t
  WHERE (t.deleted_enrollment = false)
  ORDER BY t.id_enrollment DESC;


ALTER TABLE business.view_enrollment OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 221056)
-- Name: view_forum; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_forum AS
 SELECT t.id_forum,
    t.id_course,
    t.title_forum,
    t.description_forum,
    t.date_forum,
    t.deleted_forum
   FROM business.forum t
  WHERE (t.deleted_forum = false)
  ORDER BY t.id_forum DESC;


ALTER TABLE business.view_forum OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 221060)
-- Name: view_glossary; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_glossary AS
 SELECT t.id_glossary,
    t.id_course,
    t.term_glossary,
    t.concept_glossary,
    t.date_glossary,
    t.deleted_glossary
   FROM business.glossary t
  WHERE (t.deleted_glossary = false)
  ORDER BY t.id_glossary DESC;


ALTER TABLE business.view_glossary OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 221036)
-- Name: view_newsletter; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_newsletter AS
 SELECT t.id_newsletter,
    t.id_company,
    t.id_user,
    t.name_newsletter,
    t.description_newsletter,
    t.date_newsletter,
    t.deleted
   FROM business.newsletter t
  ORDER BY t.id_newsletter DESC;


ALTER TABLE business.view_newsletter OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 221072)
-- Name: view_partial; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_partial AS
 SELECT t.id_partial,
    t.id_quimester,
    t.name_partial,
    t.description_partial,
    t.deleted_partial
   FROM business.partial t
  WHERE (t.deleted_partial = false)
  ORDER BY t.id_partial DESC;


ALTER TABLE business.view_partial OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 221020)
-- Name: view_period; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_period AS
 SELECT t.id_period,
    t.id_company,
    t.name_period,
    t.description_period,
    t.start_date_period,
    t.end_date_period,
    t.maximum_rating,
    t.approval_note_period,
    t.deleted_period
   FROM business.period t
  WHERE (t.deleted_period = false)
  ORDER BY t.id_period DESC;


ALTER TABLE business.view_period OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 221048)
-- Name: view_quimester; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_quimester AS
 SELECT t.id_quimester,
    t.id_period,
    t.name_quimester,
    t.description_quimester,
    t.deleted_quimester
   FROM business.quimester t
  WHERE (t.deleted_quimester = false)
  ORDER BY t.id_quimester DESC;


ALTER TABLE business.view_quimester OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 221064)
-- Name: view_resource; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_resource AS
 SELECT t.id_resource,
    t.id_task,
    t.name_resource,
    t.description_resource,
    t.link_resource,
    t.deleted_resource
   FROM business.resource t
  WHERE (t.deleted_resource = false)
  ORDER BY t.id_resource DESC;


ALTER TABLE business.view_resource OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 221052)
-- Name: view_resource_course; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_resource_course AS
 SELECT t.id_resource_course,
    t.id_course,
    t.id_user,
    t.file_name,
    t.length_mb,
    t.extension,
    t.server_path,
    t.upload_date
   FROM business.resource_course t
  ORDER BY t.id_resource_course DESC;


ALTER TABLE business.view_resource_course OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 221016)
-- Name: view_schedule; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_schedule AS
 SELECT t.id_schedule,
    t.start_date_schedule,
    t.end_date_schedule,
    t.tolerance_schedule,
    t.creation_date_schedule,
    t.deleted_schedule
   FROM business.schedule t
  WHERE (t.deleted_schedule = false)
  ORDER BY t.id_schedule DESC;


ALTER TABLE business.view_schedule OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 221040)
-- Name: view_task; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_task AS
 SELECT t.id_task,
    t.id_course,
    t.id_user,
    t.id_partial,
    t.name_task,
    t.description_task,
    t.status_task,
    t.creation_date_task,
    t.limit_date,
    t.deleted_task
   FROM business.task t
  WHERE (t.deleted_task = false)
  ORDER BY t.id_task DESC;


ALTER TABLE business.view_task OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 221068)
-- Name: view_user_task; Type: VIEW; Schema: business; Owner: postgres
--

CREATE VIEW business.view_user_task AS
 SELECT t.id_user_task,
    t.id_user,
    t.id_task,
    t.response_user_task,
    t.shipping_date_user_task,
    t.qualification_user_task,
    t.is_open,
    t.is_dispatched,
    t.is_qualified
   FROM business.user_task t
  ORDER BY t.id_user_task DESC;


ALTER TABLE business.view_user_task OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 220332)
-- Name: academic; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.academic (
    id_academic numeric(10,0) NOT NULL,
    title_academic character varying(250),
    abbreviation_academic character varying(50),
    nivel_academic character varying(100),
    deleted_academic boolean
);


ALTER TABLE core.academic OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 220337)
-- Name: company; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.company (
    id_company numeric(5,0) NOT NULL,
    id_setting numeric(5,0) NOT NULL,
    name_company character varying(100),
    acronym_company character varying(50),
    address_company character varying(250),
    status_company boolean,
    deleted_company boolean
);


ALTER TABLE core.company OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 220342)
-- Name: job; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.job (
    id_job numeric(10,0) NOT NULL,
    name_job character varying(200),
    address_job character varying(200),
    phone_job character varying(13),
    position_job character varying(150),
    deleted_job boolean
);


ALTER TABLE core.job OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 220350)
-- Name: navigation; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.navigation (
    id_navigation numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    name_navigation character varying(100),
    description_navigation character varying(250),
    type_navigation core."TYPE_NAVIGATION" NOT NULL,
    status_navigation boolean,
    content_navigation json,
    deleted_navigation boolean
);


ALTER TABLE core.navigation OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 220358)
-- Name: person; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.person (
    id_person numeric(10,0) NOT NULL,
    id_academic numeric(10,0) NOT NULL,
    id_job numeric(10,0) NOT NULL,
    dni_person character varying(20),
    name_person character varying(150),
    last_name_person character varying(150),
    address_person character varying(150),
    phone_person character varying(13),
    deleted_person boolean
);


ALTER TABLE core.person OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 220366)
-- Name: profile; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.profile (
    id_profile numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    type_profile core."TYPE_PROFILE" NOT NULL,
    name_profile character varying(100),
    description_profile character varying(250),
    status_profile boolean,
    deleted_profile boolean
);


ALTER TABLE core.profile OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 220371)
-- Name: profile_navigation; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.profile_navigation (
    id_profile_navigation numeric(5,0) NOT NULL,
    id_profile numeric(5,0) NOT NULL,
    id_navigation numeric(5,0) NOT NULL
);


ALTER TABLE core.profile_navigation OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 220767)
-- Name: serial_academic; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_academic
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE core.serial_academic OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 220779)
-- Name: serial_company; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_company
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_company OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 220769)
-- Name: serial_job; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_job
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE core.serial_job OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 220781)
-- Name: serial_navigation; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_navigation
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_navigation OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 220771)
-- Name: serial_person; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_person
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE core.serial_person OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 220783)
-- Name: serial_profile; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_profile
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_profile OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 220773)
-- Name: serial_profile_navigation; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_profile_navigation
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_profile_navigation OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 220789)
-- Name: serial_session; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_session
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 999999999999999
    CACHE 1;


ALTER TABLE core.serial_session OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 220775)
-- Name: serial_setting; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_setting
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_setting OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 220787)
-- Name: serial_system_event; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_system_event
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE core.serial_system_event OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 220785)
-- Name: serial_user; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_user
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;


ALTER TABLE core.serial_user OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 220777)
-- Name: serial_validation; Type: SEQUENCE; Schema: core; Owner: postgres
--

CREATE SEQUENCE core.serial_validation
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CACHE 1;


ALTER TABLE core.serial_validation OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 220402)
-- Name: session; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.session (
    id_session numeric(15,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    host_session character varying(22),
    agent_session json,
    date_sign_in_session timestamp without time zone,
    date_sign_out_session timestamp without time zone,
    status_session boolean
);


ALTER TABLE core.session OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 220376)
-- Name: setting; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.setting (
    id_setting numeric(5,0) NOT NULL,
    expiration_token numeric(10,0),
    expiration_verification_code numeric(10,0),
    inactivity_time numeric(10,0),
    session_limit numeric(2,0),
    deleted_setting boolean
);


ALTER TABLE core.setting OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 220381)
-- Name: system_event; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.system_event (
    id_system_event numeric(10,0) NOT NULL,
    id_user numeric(10,0) NOT NULL,
    table_system_event character varying(50),
    row_system_event numeric(10,0),
    action_system_event character varying(50),
    date_system_event timestamp without time zone,
    deleted_system_event boolean
);


ALTER TABLE core.system_event OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 220386)
-- Name: user; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core."user" (
    id_user numeric(10,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    id_person numeric(10,0) NOT NULL,
    id_profile numeric(5,0) NOT NULL,
    type_user core."TYPE_USER" NOT NULL,
    name_user character varying(50),
    password_user character varying(250),
    avatar_user character varying(50),
    status_user boolean,
    deleted_user boolean
);


ALTER TABLE core."user" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 220391)
-- Name: validation; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.validation (
    id_validation numeric(5,0) NOT NULL,
    id_company numeric(5,0) NOT NULL,
    type_validation core."TYPE_VALIDATION" NOT NULL,
    status_validation boolean NOT NULL,
    pattern_validation character varying(500),
    message_validation character varying(250),
    deleted_validation boolean
);


ALTER TABLE core.validation OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 220791)
-- Name: view_academic; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_academic AS
 SELECT t.id_academic,
    t.title_academic,
    t.abbreviation_academic,
    t.nivel_academic,
    t.deleted_academic
   FROM core.academic t
  WHERE (t.deleted_academic = false)
  ORDER BY t.id_academic DESC;


ALTER TABLE core.view_academic OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 220815)
-- Name: view_company; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_company AS
 SELECT t.id_company,
    t.id_setting,
    t.name_company,
    t.acronym_company,
    t.address_company,
    t.status_company,
    t.deleted_company
   FROM core.company t
  WHERE (t.deleted_company = false)
  ORDER BY t.id_company DESC;


ALTER TABLE core.view_company OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 220795)
-- Name: view_job; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_job AS
 SELECT t.id_job,
    t.name_job,
    t.address_job,
    t.phone_job,
    t.position_job,
    t.deleted_job
   FROM core.job t
  WHERE (t.deleted_job = false)
  ORDER BY t.id_job DESC;


ALTER TABLE core.view_job OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 220819)
-- Name: view_navigation; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_navigation AS
 SELECT t.id_navigation,
    t.id_company,
    t.name_navigation,
    t.description_navigation,
    t.type_navigation,
    t.status_navigation,
    t.content_navigation,
    t.deleted_navigation
   FROM core.navigation t
  WHERE (t.deleted_navigation = false)
  ORDER BY t.id_navigation DESC;


ALTER TABLE core.view_navigation OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 220799)
-- Name: view_person; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_person AS
 SELECT t.id_person,
    t.id_academic,
    t.id_job,
    t.dni_person,
    t.name_person,
    t.last_name_person,
    t.address_person,
    t.phone_person,
    t.deleted_person
   FROM core.person t
  WHERE (t.deleted_person = false)
  ORDER BY t.id_person DESC;


ALTER TABLE core.view_person OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 220823)
-- Name: view_profile; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_profile AS
 SELECT t.id_profile,
    t.id_company,
    t.type_profile,
    t.name_profile,
    t.description_profile,
    t.status_profile,
    t.deleted_profile
   FROM core.profile t
  WHERE (t.deleted_profile = false)
  ORDER BY t.id_profile DESC;


ALTER TABLE core.view_profile OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 220803)
-- Name: view_profile_navigation; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_profile_navigation AS
 SELECT t.id_profile_navigation,
    t.id_profile,
    t.id_navigation
   FROM core.profile_navigation t
  ORDER BY t.id_profile_navigation DESC;


ALTER TABLE core.view_profile_navigation OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 220835)
-- Name: view_session; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_session AS
 SELECT t.id_session,
    t.id_user,
    t.host_session,
    t.agent_session,
    t.date_sign_in_session,
    t.date_sign_out_session,
    t.status_session
   FROM core.session t
  ORDER BY t.id_session DESC;


ALTER TABLE core.view_session OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 220807)
-- Name: view_setting; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_setting AS
 SELECT t.id_setting,
    t.expiration_token,
    t.expiration_verification_code,
    t.inactivity_time,
    t.session_limit,
    t.deleted_setting
   FROM core.setting t
  WHERE (t.deleted_setting = false)
  ORDER BY t.id_setting DESC;


ALTER TABLE core.view_setting OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 220831)
-- Name: view_system_event; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_system_event AS
 SELECT t.id_system_event,
    t.id_user,
    t.table_system_event,
    t.row_system_event,
    t.action_system_event,
    t.date_system_event,
    t.deleted_system_event
   FROM core.system_event t
  WHERE (t.deleted_system_event = false)
  ORDER BY t.id_system_event DESC;


ALTER TABLE core.view_system_event OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 220827)
-- Name: view_user; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_user AS
 SELECT t.id_user,
    t.id_company,
    t.id_person,
    t.id_profile,
    t.type_user,
    t.name_user,
    t.password_user,
    t.avatar_user,
    t.status_user,
    t.deleted_user
   FROM core."user" t
  WHERE (t.deleted_user = false)
  ORDER BY t.id_user DESC;


ALTER TABLE core.view_user OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 220811)
-- Name: view_validation; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_validation AS
 SELECT t.id_validation,
    t.id_company,
    t.type_validation,
    t.status_validation,
    t.pattern_validation,
    t.message_validation,
    t.deleted_validation
   FROM core.validation t
  WHERE (t.deleted_validation = false)
  ORDER BY t.id_validation DESC;


ALTER TABLE core.view_validation OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 220972)
-- Name: view_validation_inner_company_user; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.view_validation_inner_company_user AS
 SELECT vv.id_validation,
    vv.id_company,
    vv.type_validation,
    vv.status_validation,
    vv.pattern_validation,
    vv.message_validation,
    vv.deleted_validation,
    vu.name_user
   FROM ((core.view_validation vv
     JOIN core.view_company vc ON ((vv.id_company = vc.id_company)))
     JOIN core.view_user vu ON ((vu.id_company = vc.id_company)))
  WHERE (vv.status_validation = true);


ALTER TABLE core.view_validation_inner_company_user OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 220977)
-- Name: ddl_config; Type: TABLE; Schema: dev; Owner: postgres
--

CREATE TABLE dev.ddl_config (
    table_name character varying(100),
    sequence boolean,
    view boolean,
    crud boolean,
    haved_handler_attribute character varying(100)
);


ALTER TABLE dev.ddl_config OWNER TO postgres;

--
-- TOC entry 3670 (class 0 OID 220471)
-- Dependencies: 224
-- Data for Name: assistance; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.assistance (id_assistance, id_user, id_course, start_marking_date, end_marking_date, is_late) FROM stdin;
\.


--
-- TOC entry 3669 (class 0 OID 220463)
-- Dependencies: 223
-- Data for Name: attached; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.attached (id_attached, id_user_task, file_name, length_mb, extension, server_path, upload_date) FROM stdin;
\.


--
-- TOC entry 3663 (class 0 OID 220423)
-- Dependencies: 217
-- Data for Name: career; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.career (id_career, id_company, name_career, description_career, status_career, creation_date_career, deleted_career) FROM stdin;
1	1	Nuevo curso		t	2022-03-11 15:33:01.33	f
\.


--
-- TOC entry 3671 (class 0 OID 220476)
-- Dependencies: 225
-- Data for Name: comment; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.comment (id_comment, id_user_task, id_user, value_comment, date_comment, deleted_comment) FROM stdin;
\.


--
-- TOC entry 3676 (class 0 OID 220504)
-- Dependencies: 230
-- Data for Name: comment_forum; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.comment_forum (id_comment_forum, id_forum, id_user, value_comment_forum, date_comment_forum, deleted_comment_forum) FROM stdin;
2	1	1		2022-05-06 14:36:46.32428-05	f
3	1	1		2022-05-06 14:38:23.49621-05	f
4	1	1		2022-05-06 14:39:01.426057-05	f
5	1	1		2022-05-06 14:39:48.711647-05	f
6	1	1		2022-05-06 14:39:59.89979-05	f
7	1	1	hola	2022-05-06 14:40:17.645641-05	f
1	1	1	Correccion	2022-05-06 14:44:10.96538-05	t
8	1	1	hola	2022-05-06 14:45:42.732308-05	f
\.


--
-- TOC entry 3662 (class 0 OID 220415)
-- Dependencies: 216
-- Data for Name: course; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.course (id_course, id_company, id_period, id_career, id_schedule, name_course, description_course, status_course, creation_date_course, deleted_course) FROM stdin;
1	1	1	1	1	Nueva asignatura		f	2022-05-06 14:33:03.581507	f
\.


--
-- TOC entry 3664 (class 0 OID 220431)
-- Dependencies: 218
-- Data for Name: enrollment; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.enrollment (id_enrollment, id_course, id_user, date_enrollment, status_enrollment, completed_course, deleted_enrollment) FROM stdin;
\.


--
-- TOC entry 3675 (class 0 OID 220499)
-- Dependencies: 229
-- Data for Name: forum; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.forum (id_forum, id_course, title_forum, description_forum, date_forum, deleted_forum) FROM stdin;
1	1	Nuevo foro		2022-05-06 14:33:08.184557-05	f
\.


--
-- TOC entry 3677 (class 0 OID 220509)
-- Dependencies: 231
-- Data for Name: glossary; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.glossary (id_glossary, id_course, term_glossary, concept_glossary, date_glossary, deleted_glossary) FROM stdin;
2	1	Nuevo termino		2022-05-06 15:16:06.5516-05	f
1	1	Nuevo asdas	Es el concento	2022-05-06 15:16:06.551-05	t
\.


--
-- TOC entry 3678 (class 0 OID 220514)
-- Dependencies: 232
-- Data for Name: newsletter; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.newsletter (id_newsletter, id_company, id_user, name_newsletter, description_newsletter, date_newsletter, deleted) FROM stdin;
\.


--
-- TOC entry 3673 (class 0 OID 220486)
-- Dependencies: 227
-- Data for Name: partial; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.partial (id_partial, id_quimester, name_partial, description_partial, deleted_partial) FROM stdin;
1	1	Nuevo parcial		f
\.


--
-- TOC entry 3661 (class 0 OID 220410)
-- Dependencies: 215
-- Data for Name: period; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.period (id_period, id_company, name_period, description_period, start_date_period, end_date_period, maximum_rating, approval_note_period, deleted_period) FROM stdin;
1	1	Nuevo periodo		2022-05-06 14:32:47.932099	2022-05-06 14:32:47.932099	10	7	f
\.


--
-- TOC entry 3672 (class 0 OID 220481)
-- Dependencies: 226
-- Data for Name: quimester; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.quimester (id_quimester, id_period, name_quimester, description_quimester, deleted_quimester) FROM stdin;
1	1	Nuevo quimestre		f
\.


--
-- TOC entry 3667 (class 0 OID 220446)
-- Dependencies: 221
-- Data for Name: resource; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.resource (id_resource, id_task, name_resource, description_resource, link_resource, deleted_resource) FROM stdin;
\.


--
-- TOC entry 3674 (class 0 OID 220491)
-- Dependencies: 228
-- Data for Name: resource_course; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.resource_course (id_resource_course, id_course, id_user, file_name, length_mb, extension, server_path, upload_date) FROM stdin;
\.


--
-- TOC entry 3665 (class 0 OID 220436)
-- Dependencies: 219
-- Data for Name: schedule; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.schedule (id_schedule, start_date_schedule, end_date_schedule, tolerance_schedule, creation_date_schedule, deleted_schedule) FROM stdin;
1	14:33:03.581507	14:33:03.581507	60	2022-05-06 14:33:03.581507	f
\.


--
-- TOC entry 3666 (class 0 OID 220441)
-- Dependencies: 220
-- Data for Name: task; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.task (id_task, id_course, id_user, id_partial, name_task, description_task, status_task, creation_date_task, limit_date, deleted_task) FROM stdin;
\.


--
-- TOC entry 3668 (class 0 OID 220454)
-- Dependencies: 222
-- Data for Name: user_task; Type: TABLE DATA; Schema: business; Owner: postgres
--

COPY business.user_task (id_user_task, id_user, id_task, response_user_task, shipping_date_user_task, qualification_user_task, is_open, is_dispatched, is_qualified) FROM stdin;
\.


--
-- TOC entry 3649 (class 0 OID 220332)
-- Dependencies: 203
-- Data for Name: academic; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.academic (id_academic, title_academic, abbreviation_academic, nivel_academic, deleted_academic) FROM stdin;
1	Titulo Administrador	Abreviación titulo	Nivel titulo	f
\.


--
-- TOC entry 3650 (class 0 OID 220337)
-- Dependencies: 204
-- Data for Name: company; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.company (id_company, id_setting, name_company, acronym_company, address_company, status_company, deleted_company) FROM stdin;
1	1	UNIDAD EDUCATIVA BILINGÜE TSANTSA	UETSANTSA	PUYO	t	f
\.


--
-- TOC entry 3651 (class 0 OID 220342)
-- Dependencies: 205
-- Data for Name: job; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.job (id_job, name_job, address_job, phone_job, position_job, deleted_job) FROM stdin;
1	Empresa	Dirección	+593	Cargo	f
\.


--
-- TOC entry 3652 (class 0 OID 220350)
-- Dependencies: 206
-- Data for Name: navigation; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.navigation (id_navigation, id_company, name_navigation, description_navigation, type_navigation, status_navigation, content_navigation, deleted_navigation) FROM stdin;
1	1	Administrador (Por defecto)	Navegación por defecto para el administrador	defaultNavigation	t	[\n\t{\n\t\t"id": "core",\n\t\t"title": "Administración",\n\t\t"subtitle": "Administración core del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:chip",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "core.company",\n\t\t\t\t"title": "Institución",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:office-building",\n\t\t\t\t"link": "/core/company"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.validation",\n\t\t\t\t"title": "Validaciones",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:security",\n\t\t\t\t"link": "/core/validation"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.navigation",\n\t\t\t\t"title": "Navegación",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:template",\n\t\t\t\t"link": "/core/navigation"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.profile",\n\t\t\t\t"title": "Perfil",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user-group",\n\t\t\t\t"link": "/core/profile"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.user",\n\t\t\t\t"title": "Usuario",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user",\n\t\t\t\t"link": "/core/user"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.session",\n\t\t\t\t"title": "Sesiones",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:login",\n\t\t\t\t"link": "/core/session"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.system-event",\n\t\t\t\t"title": "Eventos del sistema",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:event",\n\t\t\t\t"link": "/core/system-event"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.period",\n\t\t\t\t"title": "Periodos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:timeline",\n\t\t\t\t"link": "/business/period"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.career",\n\t\t\t\t"title": "Cursos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:account_tree",\n\t\t\t\t"link": "/business/career"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.course",\n\t\t\t\t"title": "Asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:academic-cap",\n\t\t\t\t"link": "/business/course"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "report",\n\t\t"title": "Reportes",\n\t\t"subtitle": "Reportes del sistema",\n\t\t"type": "basic",\n\t\t"link": "/report"\n\t}\n]	f
2	1	Administrador (Compacta)	Navegación compacta para el administrador	compactNavigation	t	[\n  {\n    "id": "core",\n    "title": "Administración",\n    "type": "aside",\n    "icon": "heroicons_outline:chip",\n    "children": []\n  },\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  },\n  {\n    "id": "report",\n    "title": "Reportes",\n    "type": "basic",\n    "icon": "heroicons_outline:document-report",\n    "link": "/report"\n  }\n]	f
3	1	Administrador (Futurista)	Navegación futurista para el administrador	futuristicNavigation	t	[\n\t{\n\t\t"id": "core",\n\t\t"title": "Administración",\n\t\t"subtitle": "Administración core del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:chip",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "core.company",\n\t\t\t\t"title": "Institución",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:office-building",\n\t\t\t\t"link": "/core/company"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.validation",\n\t\t\t\t"title": "Validaciones",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:security",\n\t\t\t\t"link": "/core/validation"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.navigation",\n\t\t\t\t"title": "Navegación",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:template",\n\t\t\t\t"link": "/core/navigation"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.profile",\n\t\t\t\t"title": "Perfil",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user-group",\n\t\t\t\t"link": "/core/profile"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.user",\n\t\t\t\t"title": "Usuario",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user",\n\t\t\t\t"link": "/core/user"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.session",\n\t\t\t\t"title": "Sesiones",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:login",\n\t\t\t\t"link": "/core/session"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "core.system-event",\n\t\t\t\t"title": "Eventos del sistema",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:event",\n\t\t\t\t"link": "/core/system-event"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.period",\n\t\t\t\t"title": "Periodos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:timeline",\n\t\t\t\t"link": "/business/period"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.career",\n\t\t\t\t"title": "Cursos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:account_tree",\n\t\t\t\t"link": "/business/career"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.course",\n\t\t\t\t"title": "Asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:academic-cap",\n\t\t\t\t"link": "/business/course"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "report",\n\t\t"title": "Reportes",\n\t\t"subtitle": "Reportes del sistema",\n\t\t"type": "basic",\n\t\t"link": "/report"\n\t}\n]	f
4	1	Administrador (Horizontal)	Navegación horizontal para el administrador	horizontalNavigation	t	[\n  {\n    "id": "core",\n    "title": "Administración",\n    "type": "aside",\n    "icon": "heroicons_outline:chip",\n    "children": []\n  },\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  },\n  {\n    "id": "report",\n    "title": "Reportes",\n    "type": "basic",\n    "icon": "heroicons_outline:document-report",\n    "link": "/report"\n  }\n]	f
5	1	Maestro (Por defecto)	Navegación por defecto para el maestro	defaultNavigation	t	[\n\t{\n\t\t"id": "core",\n\t\t"title": "Administración",\n\t\t"subtitle": "Administración core del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:chip",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "core.user",\n\t\t\t\t"title": "Usuario",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user",\n\t\t\t\t"link": "/core/user"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.period",\n\t\t\t\t"title": "Periodos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:timeline",\n\t\t\t\t"link": "/business/period"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.career",\n\t\t\t\t"title": "Cursos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:account_tree",\n\t\t\t\t"link": "/business/career"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.course",\n\t\t\t\t"title": "Asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:academic-cap",\n\t\t\t\t"link": "/business/course"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.task",\n\t\t\t\t"title": "Tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:book-open",\n\t\t\t\t"link": "/business/task"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.user-task",\n\t\t\t\t"title": "Mis tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:auto_stories",\n\t\t\t\t"link": "/business/user-task"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "report",\n\t\t"title": "Reportes",\n\t\t"subtitle": "Reportes del sistema",\n\t\t"type": "basic",\n\t\t"link": "/report"\n\t}\n]	f
6	1	Maestro (Compacta)	Navegación compacta para el maestro	compactNavigation	t	[\n  {\n    "id": "core",\n    "title": "Administración",\n    "type": "aside",\n    "icon": "heroicons_outline:chip",\n    "children": []\n  },\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  },\n  {\n    "id": "report",\n    "title": "Reportes",\n    "type": "basic",\n    "icon": "heroicons_outline:document-report",\n    "link": "/report"\n  }\n]	f
7	1	Maestro (Futurista)	Navegación futurista para el maestro	futuristicNavigation	t	[\n\t{\n\t\t"id": "core",\n\t\t"title": "Administración",\n\t\t"subtitle": "Administración core del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:chip",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "core.user",\n\t\t\t\t"title": "Usuario",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:user",\n\t\t\t\t"link": "/core/user"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.period",\n\t\t\t\t"title": "Periodos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:timeline",\n\t\t\t\t"link": "/business/period"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.career",\n\t\t\t\t"title": "Cursos",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:account_tree",\n\t\t\t\t"link": "/business/career"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.course",\n\t\t\t\t"title": "Asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:academic-cap",\n\t\t\t\t"link": "/business/course"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.task",\n\t\t\t\t"title": "Tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:book-open",\n\t\t\t\t"link": "/business/task"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.user-task",\n\t\t\t\t"title": "Mis tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:auto_stories",\n\t\t\t\t"link": "/business/user-task"\n\t\t\t}\n\t\t]\n\t},\n\t{\n\t\t"id": "report",\n\t\t"title": "Reportes",\n\t\t"subtitle": "Reportes del sistema",\n\t\t"type": "basic",\n\t\t"link": "/report"\n\t}\n]	f
8	1	Maestro (Horizontal)	Navegación horizontal para el maestro	horizontalNavigation	t	[\n  {\n    "id": "core",\n    "title": "Administración",\n    "type": "aside",\n    "icon": "heroicons_outline:chip",\n    "children": []\n  },\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  },\n  {\n    "id": "report",\n    "title": "Reportes",\n    "type": "basic",\n    "icon": "heroicons_outline:document-report",\n    "link": "/report"\n  }\n]	f
9	1	Estudiante (Por defecto)	Navegación por defecto para el estudiante	defaultNavigation	t	[\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.my-courses",\n\t\t\t\t"title": "Mis asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:ballot",\n\t\t\t\t"link": "/business/my-courses"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.user-task",\n\t\t\t\t"title": "Mis tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:auto_stories",\n\t\t\t\t"link": "/business/user-task"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.assistance",\n\t\t\t\t"title": "Mis asistencias",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_solid:blur_linear",\n\t\t\t\t"link": "/business/assistance"\n\t\t\t}\n\t\t]\n\t}\n]	f
10	1	Estudiante (Compacta)	Navegación compacta para el estudiante	compactNavigation	t	[\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  }\n]	f
11	1	Estudiante (Futurista)	Navegación futurista para el estudiante	futuristicNavigation	t	[\n\t{\n\t\t"id": "business",\n\t\t"title": "Académico",\n\t\t"subtitle": "Administración académica del sistema",\n\t\t"type": "group",\n\t\t"icon": "heroicons_outline:cube-transparent",\n\t\t"children": [\n\t\t\t{\n\t\t\t\t"id": "business.home",\n\t\t\t\t"title": "Inicio",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "heroicons_outline:home",\n\t\t\t\t"link": "/business/home"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.my-courses",\n\t\t\t\t"title": "Mis asignaturas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:ballot",\n\t\t\t\t"link": "/business/my-courses"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.user-task",\n\t\t\t\t"title": "Mis tareas",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_outline:auto_stories",\n\t\t\t\t"link": "/business/user-task"\n\t\t\t},\n\t\t\t{\n\t\t\t\t"id": "business.assistance",\n\t\t\t\t"title": "Mis asistencias",\n\t\t\t\t"type": "basic",\n\t\t\t\t"icon": "mat_solid:blur_linear",\n\t\t\t\t"link": "/business/assistance"\n\t\t\t}\n\t\t]\n\t}\n]	f
12	1	Estudiante (Horizontal)	Navegación horizontal para el estudiante	horizontalNavigation	t	[\n  {\n    "id": "business",\n    "title": "Académico",\n    "type": "aside",\n    "icon": "mat_outline:business",\n    "children": []\n  }\n]	f
\.


--
-- TOC entry 3653 (class 0 OID 220358)
-- Dependencies: 207
-- Data for Name: person; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.person (id_person, id_academic, id_job, dni_person, name_person, last_name_person, address_person, phone_person, deleted_person) FROM stdin;
1	1	1	1600959348	EDGAR RENATO	VARGAS TANCHIMIA	TSURAKU	+593995486239	f
\.


--
-- TOC entry 3654 (class 0 OID 220366)
-- Dependencies: 208
-- Data for Name: profile; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.profile (id_profile, id_company, type_profile, name_profile, description_profile, status_profile, deleted_profile) FROM stdin;
1	1	administator	Perfil Administrador	Perfil de usuario para el administrador	t	f
2	1	commonProfile	Perfil Maestro	Perfil de usuario para el maestro	t	f
3	1	commonProfile	Perfil Estudiante	Perfil de usuario para el estudiante	t	f
\.


--
-- TOC entry 3655 (class 0 OID 220371)
-- Dependencies: 209
-- Data for Name: profile_navigation; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.profile_navigation (id_profile_navigation, id_profile, id_navigation) FROM stdin;
1	1	1
2	1	2
3	1	3
4	1	4
5	2	5
6	2	6
7	2	7
8	2	8
9	3	9
10	3	10
11	3	11
12	3	12
\.


--
-- TOC entry 3660 (class 0 OID 220402)
-- Dependencies: 214
-- Data for Name: session; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.session (id_session, id_user, host_session, agent_session, date_sign_in_session, date_sign_out_session, status_session) FROM stdin;
\.


--
-- TOC entry 3656 (class 0 OID 220376)
-- Dependencies: 210
-- Data for Name: setting; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.setting (id_setting, expiration_token, expiration_verification_code, inactivity_time, session_limit, deleted_setting) FROM stdin;
1	30000	30000	30000	5	f
\.


--
-- TOC entry 3657 (class 0 OID 220381)
-- Dependencies: 211
-- Data for Name: system_event; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.system_event (id_system_event, id_user, table_system_event, row_system_event, action_system_event, date_system_event, deleted_system_event) FROM stdin;
1	1	period	1	CREATE	2022-05-06 14:32:47.932099	f
2	1	quimester	1	CREATE	2022-05-06 14:32:50.848146	f
3	1	partial	1	CREATE	2022-05-06 14:32:53.421965	f
4	1	career	1	CREATE	2022-05-06 14:32:56.626676	f
5	1	career	1	UPDATE	2022-05-06 14:32:59.528426	f
6	1	schedule	1	CREATE	2022-05-06 14:33:03.581507	f
7	1	course	1	CREATE	2022-05-06 14:33:03.581507	f
8	1	forum	1	CREATE	2022-05-06 14:33:08.184557	f
9	1	comment_forum	1	CREATE	2022-05-06 14:33:14.244581	f
10	1	comment_forum	2	CREATE	2022-05-06 14:36:46.32428	f
11	1	comment_forum	3	CREATE	2022-05-06 14:38:23.49621	f
12	1	comment_forum	4	CREATE	2022-05-06 14:39:01.426057	f
13	1	comment_forum	5	CREATE	2022-05-06 14:39:48.711647	f
14	1	comment_forum	6	CREATE	2022-05-06 14:39:59.89979	f
15	1	comment_forum	7	CREATE	2022-05-06 14:40:17.645641	f
16	1	comment_forum	1	UPDATE	2022-05-06 14:43:58.287901	f
17	1	comment_forum	1	UPDATE	2022-05-06 14:44:06.709268	f
18	1	comment_forum	1	UPDATE	2022-05-06 14:44:10.96538	f
19	1	comment_forum	1	DELETE	2022-05-06 14:44:20.55032	f
20	1	comment_forum	8	CREATE	2022-05-06 14:45:42.732308	f
21	1	glossary	1	CREATE	2022-05-06 15:12:56.357219	f
22	1	glossary	2	CREATE	2022-05-06 15:16:06.5516	f
24	1	glossary	1	UPDATE	2022-05-06 15:21:33.729266	f
25	1	glossary	1	DELETE	2022-05-06 15:21:51.958966	f
\.


--
-- TOC entry 3658 (class 0 OID 220386)
-- Dependencies: 212
-- Data for Name: user; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core."user" (id_user, id_company, id_person, id_profile, type_user, name_user, password_user, avatar_user, status_user, deleted_user) FROM stdin;
1	1	1	1	teacher	tsantsa.edu@gmail.com	uOuuMWQb8Ll7Kj9QkunbTg==	default.svg	t	f
\.


--
-- TOC entry 3659 (class 0 OID 220391)
-- Dependencies: 213
-- Data for Name: validation; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.validation (id_validation, id_company, type_validation, status_validation, pattern_validation, message_validation, deleted_validation) FROM stdin;
\.


--
-- TOC entry 3691 (class 0 OID 220977)
-- Dependencies: 258
-- Data for Name: ddl_config; Type: TABLE DATA; Schema: dev; Owner: postgres
--

COPY dev.ddl_config (table_name, sequence, view, crud, haved_handler_attribute) FROM stdin;
schedule	t	t	t	id_schedule
enrollment	t	t	t	id_enrollment
newsletter	t	t	t	id_newsletter
assistance	t	t	t	id_assistance
quimester	t	t	t	id_quimester
resource_course	t	t	t	id_resource_course
forum	t	t	t	id_forum
glossary	t	t	t	id_glossary
resource	t	t	t	id_resource
user_task	t	t	t	id_user_task
partial	t	t	t	id_partial
comment_forum	t	t	t	id_comment_forum
attached	t	t	t	id_attached
comment	t	t	t	id_comment
period	t	t	t	name_period
career	t	t	t	name_career
course	t	t	t	name_course
task	t	t	t	name_task
\.


--
-- TOC entry 3716 (class 0 OID 0)
-- Dependencies: 266
-- Name: serial_assistance; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_assistance', 1, true);


--
-- TOC entry 3717 (class 0 OID 0)
-- Dependencies: 275
-- Name: serial_attached; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_attached', 1, true);


--
-- TOC entry 3718 (class 0 OID 0)
-- Dependencies: 262
-- Name: serial_career; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_career', 2, true);


--
-- TOC entry 3719 (class 0 OID 0)
-- Dependencies: 276
-- Name: serial_comment; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_comment', 1, true);


--
-- TOC entry 3720 (class 0 OID 0)
-- Dependencies: 274
-- Name: serial_comment_forum; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_comment_forum', 9, true);


--
-- TOC entry 3721 (class 0 OID 0)
-- Dependencies: 261
-- Name: serial_course; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_course', 2, true);


--
-- TOC entry 3722 (class 0 OID 0)
-- Dependencies: 263
-- Name: serial_enrollment; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_enrollment', 1, true);


--
-- TOC entry 3723 (class 0 OID 0)
-- Dependencies: 269
-- Name: serial_forum; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_forum', 2, true);


--
-- TOC entry 3724 (class 0 OID 0)
-- Dependencies: 270
-- Name: serial_glossary; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_glossary', 3, true);


--
-- TOC entry 3725 (class 0 OID 0)
-- Dependencies: 264
-- Name: serial_newsletter; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_newsletter', 1, true);


--
-- TOC entry 3726 (class 0 OID 0)
-- Dependencies: 273
-- Name: serial_partial; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_partial', 2, true);


--
-- TOC entry 3727 (class 0 OID 0)
-- Dependencies: 260
-- Name: serial_period; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_period', 2, true);


--
-- TOC entry 3728 (class 0 OID 0)
-- Dependencies: 267
-- Name: serial_quimester; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_quimester', 2, true);


--
-- TOC entry 3729 (class 0 OID 0)
-- Dependencies: 271
-- Name: serial_resource; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_resource', 1, true);


--
-- TOC entry 3730 (class 0 OID 0)
-- Dependencies: 268
-- Name: serial_resource_course; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_resource_course', 1, true);


--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 259
-- Name: serial_schedule; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_schedule', 2, true);


--
-- TOC entry 3732 (class 0 OID 0)
-- Dependencies: 265
-- Name: serial_task; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_task', 1, true);


--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 272
-- Name: serial_user_task; Type: SEQUENCE SET; Schema: business; Owner: postgres
--

SELECT pg_catalog.setval('business.serial_user_task', 1, true);


--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 233
-- Name: serial_academic; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_academic', 2, true);


--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 239
-- Name: serial_company; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_company', 2, true);


--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 234
-- Name: serial_job; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_job', 2, true);


--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 240
-- Name: serial_navigation; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_navigation', 13, true);


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 235
-- Name: serial_person; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_person', 2, true);


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 241
-- Name: serial_profile; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_profile', 4, true);


--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 236
-- Name: serial_profile_navigation; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_profile_navigation', 13, true);


--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 244
-- Name: serial_session; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_session', 1, true);


--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 237
-- Name: serial_setting; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_setting', 2, true);


--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 243
-- Name: serial_system_event; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_system_event', 26, true);


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 242
-- Name: serial_user; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_user', 2, true);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 238
-- Name: serial_validation; Type: SEQUENCE SET; Schema: core; Owner: postgres
--

SELECT pg_catalog.setval('core.serial_validation', 1, true);


--
-- TOC entry 3438 (class 2606 OID 220475)
-- Name: assistance assistance_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.assistance
    ADD CONSTRAINT assistance_pkey PRIMARY KEY (id_assistance);


--
-- TOC entry 3436 (class 2606 OID 220470)
-- Name: attached attached_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.attached
    ADD CONSTRAINT attached_pkey PRIMARY KEY (id_attached);


--
-- TOC entry 3424 (class 2606 OID 220430)
-- Name: career career_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.career
    ADD CONSTRAINT career_pkey PRIMARY KEY (id_career);


--
-- TOC entry 3450 (class 2606 OID 220508)
-- Name: comment_forum comment_forum_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment_forum
    ADD CONSTRAINT comment_forum_pkey PRIMARY KEY (id_comment_forum);


--
-- TOC entry 3440 (class 2606 OID 220480)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id_comment);


--
-- TOC entry 3422 (class 2606 OID 220422)
-- Name: course course_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (id_course);


--
-- TOC entry 3426 (class 2606 OID 220435)
-- Name: enrollment enrollment_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.enrollment
    ADD CONSTRAINT enrollment_pkey PRIMARY KEY (id_enrollment);


--
-- TOC entry 3448 (class 2606 OID 220503)
-- Name: forum forum_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.forum
    ADD CONSTRAINT forum_pkey PRIMARY KEY (id_forum);


--
-- TOC entry 3452 (class 2606 OID 220513)
-- Name: glossary glossary_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.glossary
    ADD CONSTRAINT glossary_pkey PRIMARY KEY (id_glossary);


--
-- TOC entry 3454 (class 2606 OID 220518)
-- Name: newsletter newsletter_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.newsletter
    ADD CONSTRAINT newsletter_pkey PRIMARY KEY (id_newsletter);


--
-- TOC entry 3444 (class 2606 OID 220490)
-- Name: partial partial_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.partial
    ADD CONSTRAINT partial_pkey PRIMARY KEY (id_partial);


--
-- TOC entry 3420 (class 2606 OID 220414)
-- Name: period period_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.period
    ADD CONSTRAINT period_pkey PRIMARY KEY (id_period);


--
-- TOC entry 3442 (class 2606 OID 220485)
-- Name: quimester quimester_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.quimester
    ADD CONSTRAINT quimester_pkey PRIMARY KEY (id_quimester);


--
-- TOC entry 3446 (class 2606 OID 220498)
-- Name: resource_course resource_course_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.resource_course
    ADD CONSTRAINT resource_course_pkey PRIMARY KEY (id_resource_course);


--
-- TOC entry 3432 (class 2606 OID 220453)
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id_resource);


--
-- TOC entry 3428 (class 2606 OID 220440)
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (id_schedule);


--
-- TOC entry 3430 (class 2606 OID 220445)
-- Name: task task_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id_task);


--
-- TOC entry 3434 (class 2606 OID 220462)
-- Name: user_task user_task_pkey; Type: CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.user_task
    ADD CONSTRAINT user_task_pkey PRIMARY KEY (id_user_task);


--
-- TOC entry 3396 (class 2606 OID 220336)
-- Name: academic academic_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.academic
    ADD CONSTRAINT academic_pkey PRIMARY KEY (id_academic);


--
-- TOC entry 3398 (class 2606 OID 220341)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id_company);


--
-- TOC entry 3400 (class 2606 OID 220349)
-- Name: job job_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id_job);


--
-- TOC entry 3402 (class 2606 OID 220357)
-- Name: navigation navigation_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.navigation
    ADD CONSTRAINT navigation_pkey PRIMARY KEY (id_navigation);


--
-- TOC entry 3404 (class 2606 OID 220365)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (id_person);


--
-- TOC entry 3408 (class 2606 OID 220375)
-- Name: profile_navigation profile_navigation_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.profile_navigation
    ADD CONSTRAINT profile_navigation_pkey PRIMARY KEY (id_profile_navigation);


--
-- TOC entry 3406 (class 2606 OID 220370)
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id_profile);


--
-- TOC entry 3418 (class 2606 OID 220409)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id_session);


--
-- TOC entry 3410 (class 2606 OID 220380)
-- Name: setting setting_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.setting
    ADD CONSTRAINT setting_pkey PRIMARY KEY (id_setting);


--
-- TOC entry 3412 (class 2606 OID 220385)
-- Name: system_event system_event_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.system_event
    ADD CONSTRAINT system_event_pkey PRIMARY KEY (id_system_event);


--
-- TOC entry 3414 (class 2606 OID 220390)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id_user);


--
-- TOC entry 3416 (class 2606 OID 220398)
-- Name: validation validation_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.validation
    ADD CONSTRAINT validation_pkey PRIMARY KEY (id_validation);


--
-- TOC entry 3475 (class 2606 OID 220619)
-- Name: assistance assistance_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.assistance
    ADD CONSTRAINT assistance_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3474 (class 2606 OID 220614)
-- Name: assistance assistance_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.assistance
    ADD CONSTRAINT assistance_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3473 (class 2606 OID 220609)
-- Name: attached attached_id_user_task_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.attached
    ADD CONSTRAINT attached_id_user_task_fkey FOREIGN KEY (id_user_task) REFERENCES business.user_task(id_user_task) NOT VALID;


--
-- TOC entry 3464 (class 2606 OID 220564)
-- Name: career career_id_company_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.career
    ADD CONSTRAINT career_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3483 (class 2606 OID 220659)
-- Name: comment_forum comment_forum_id_forum_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment_forum
    ADD CONSTRAINT comment_forum_id_forum_fkey FOREIGN KEY (id_forum) REFERENCES business.forum(id_forum) NOT VALID;


--
-- TOC entry 3484 (class 2606 OID 220664)
-- Name: comment_forum comment_forum_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment_forum
    ADD CONSTRAINT comment_forum_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3477 (class 2606 OID 220629)
-- Name: comment comment_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment
    ADD CONSTRAINT comment_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3476 (class 2606 OID 220624)
-- Name: comment comment_id_user_task_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.comment
    ADD CONSTRAINT comment_id_user_task_fkey FOREIGN KEY (id_user_task) REFERENCES business.user_task(id_user_task) NOT VALID;


--
-- TOC entry 3462 (class 2606 OID 220554)
-- Name: course course_id_career_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.course
    ADD CONSTRAINT course_id_career_fkey FOREIGN KEY (id_career) REFERENCES business.career(id_career) NOT VALID;


--
-- TOC entry 3460 (class 2606 OID 220544)
-- Name: course course_id_company_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.course
    ADD CONSTRAINT course_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3461 (class 2606 OID 220549)
-- Name: course course_id_period_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.course
    ADD CONSTRAINT course_id_period_fkey FOREIGN KEY (id_period) REFERENCES business.period(id_period) NOT VALID;


--
-- TOC entry 3463 (class 2606 OID 220559)
-- Name: course course_id_schedule_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.course
    ADD CONSTRAINT course_id_schedule_fkey FOREIGN KEY (id_schedule) REFERENCES business.schedule(id_schedule) NOT VALID;


--
-- TOC entry 3466 (class 2606 OID 220574)
-- Name: enrollment enrollment_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.enrollment
    ADD CONSTRAINT enrollment_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3465 (class 2606 OID 220569)
-- Name: enrollment enrollment_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.enrollment
    ADD CONSTRAINT enrollment_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3482 (class 2606 OID 220654)
-- Name: forum forum_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.forum
    ADD CONSTRAINT forum_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3485 (class 2606 OID 220669)
-- Name: glossary glossary_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.glossary
    ADD CONSTRAINT glossary_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3486 (class 2606 OID 220674)
-- Name: newsletter newsletter_id_company_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.newsletter
    ADD CONSTRAINT newsletter_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3487 (class 2606 OID 220679)
-- Name: newsletter newsletter_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.newsletter
    ADD CONSTRAINT newsletter_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3479 (class 2606 OID 220639)
-- Name: partial partial_id_quimester_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.partial
    ADD CONSTRAINT partial_id_quimester_fkey FOREIGN KEY (id_quimester) REFERENCES business.quimester(id_quimester) NOT VALID;


--
-- TOC entry 3459 (class 2606 OID 220539)
-- Name: period period_id_company_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.period
    ADD CONSTRAINT period_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3478 (class 2606 OID 220634)
-- Name: quimester quimester_id_period_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.quimester
    ADD CONSTRAINT quimester_id_period_fkey FOREIGN KEY (id_period) REFERENCES business.period(id_period) NOT VALID;


--
-- TOC entry 3480 (class 2606 OID 220644)
-- Name: resource_course resource_course_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.resource_course
    ADD CONSTRAINT resource_course_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3481 (class 2606 OID 220649)
-- Name: resource_course resource_course_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.resource_course
    ADD CONSTRAINT resource_course_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3470 (class 2606 OID 220594)
-- Name: resource resource_id_task_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.resource
    ADD CONSTRAINT resource_id_task_fkey FOREIGN KEY (id_task) REFERENCES business.task(id_task) NOT VALID;


--
-- TOC entry 3467 (class 2606 OID 220579)
-- Name: task task_id_course_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.task
    ADD CONSTRAINT task_id_course_fkey FOREIGN KEY (id_course) REFERENCES business.course(id_course) NOT VALID;


--
-- TOC entry 3469 (class 2606 OID 220589)
-- Name: task task_id_partial_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.task
    ADD CONSTRAINT task_id_partial_fkey FOREIGN KEY (id_partial) REFERENCES business.partial(id_partial) NOT VALID;


--
-- TOC entry 3468 (class 2606 OID 220584)
-- Name: task task_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.task
    ADD CONSTRAINT task_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3472 (class 2606 OID 220604)
-- Name: user_task user_task_id_task_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.user_task
    ADD CONSTRAINT user_task_id_task_fkey FOREIGN KEY (id_task) REFERENCES business.task(id_task) NOT VALID;


--
-- TOC entry 3471 (class 2606 OID 220599)
-- Name: user_task user_task_id_user_fkey; Type: FK CONSTRAINT; Schema: business; Owner: postgres
--

ALTER TABLE ONLY business.user_task
    ADD CONSTRAINT user_task_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3455 (class 2606 OID 220519)
-- Name: navigation navigation_id_company_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.navigation
    ADD CONSTRAINT navigation_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3456 (class 2606 OID 220524)
-- Name: profile profile_id_company_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.profile
    ADD CONSTRAINT profile_id_company_fkey FOREIGN KEY (id_company) REFERENCES core.company(id_company) NOT VALID;


--
-- TOC entry 3458 (class 2606 OID 220534)
-- Name: session session_id_user_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.session
    ADD CONSTRAINT session_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


--
-- TOC entry 3457 (class 2606 OID 220529)
-- Name: system_event system_event_id_user_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.system_event
    ADD CONSTRAINT system_event_id_user_fkey FOREIGN KEY (id_user) REFERENCES core."user"(id_user) NOT VALID;


-- Completed on 2022-05-09 11:06:03

--
-- PostgreSQL database dump complete
--

