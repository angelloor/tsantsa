-- FUNCTION: core.dml_company_create_modified(numeric)
-- DROP FUNCTION IF EXISTS core.dml_company_create_modified(numeric);

CREATE OR REPLACE FUNCTION core.dml_company_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_company numeric, id_setting numeric, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, deleted_company boolean, expiration_token numeric, expiration_verification_code numeric, inactivity_time numeric, session_limit numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_company_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_company_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean, boolean, numeric, numeric, numeric, numeric, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_company_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean, boolean, numeric, numeric, numeric, numeric, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_company_update_modified(
	id_user_ numeric,
	_id_company numeric,
	_id_setting numeric,
	_name_company character varying,
	_acronym_company character varying,
	_address_company character varying,
	_status_company boolean,
	_deleted_company boolean,
	_expiration_token numeric,
	_expiration_verification_code numeric,
	_inactivity_time numeric,
	_session_limit numeric)
    RETURNS TABLE(id_company numeric, id_setting numeric, name_company character varying, acronym_company character varying, address_company character varying, status_company boolean, deleted_company boolean, expiration_token numeric, expiration_verification_code numeric, inactivity_time numeric, session_limit numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_company_update_modified(numeric, numeric, numeric, character varying, character varying, character varying, boolean, boolean, numeric, numeric, numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_company_delete_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_company_delete_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_company_delete_modified(
	id_user_ numeric,
	_id_company numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_company_delete_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_validation_create_modified(numeric, core."TYPE_VALIDATION")
-- DROP FUNCTION IF EXISTS core.dml_validation_create_modified(numeric, core."TYPE_VALIDATION");

CREATE OR REPLACE FUNCTION core.dml_validation_create_modified(
	id_user_ numeric,
	_type_validation core."TYPE_VALIDATION")
    RETURNS TABLE(id_validation numeric, id_company numeric, type_validation core."TYPE_VALIDATION", status_validation boolean, pattern_validation character varying, message_validation character varying, deleted_validation boolean, name_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_validation_create_modified(numeric, core."TYPE_VALIDATION")
    OWNER TO postgres;

-- FUNCTION: core.dml_validation_update_modified(numeric, numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean)
-- DROP FUNCTION IF EXISTS core.dml_validation_update_modified(numeric, numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean);

CREATE OR REPLACE FUNCTION core.dml_validation_update_modified(
	id_user_ numeric,
	_id_validation numeric,
	_id_company numeric,
	_type_validation core."TYPE_VALIDATION",
	_status_validation boolean,
	_pattern_validation character varying,
	_message_validation character varying,
	_deleted_validation boolean)
    RETURNS TABLE(id_validation numeric, id_company numeric, type_validation core."TYPE_VALIDATION", status_validation boolean, pattern_validation character varying, message_validation character varying, deleted_validation boolean, name_company character varying, status_company boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_validation_update_modified(numeric, numeric, numeric, core."TYPE_VALIDATION", boolean, character varying, character varying, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_navigation_create(numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
-- DROP FUNCTION IF EXISTS core.dml_navigation_create(numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean);

CREATE OR REPLACE FUNCTION core.dml_navigation_create(
	id_user_ numeric,
	_id_company numeric,
	_name_navigation character varying,
	_description_navigation character varying,
	_type_navigation core."TYPE_NAVIGATION",
	_status_navigation boolean,
	_content_navigation json,
	_deleted_navigation boolean)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_navigation_create(numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_navigation_create_modified(numeric)
-- DROP FUNCTION IF EXISTS core.dml_navigation_create_modified(numeric);

CREATE OR REPLACE FUNCTION core.dml_navigation_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_navigation numeric, id_company numeric, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json, deleted_navigation boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_navigation_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_navigation_update(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
-- DROP FUNCTION IF EXISTS core.dml_navigation_update(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean);

CREATE OR REPLACE FUNCTION core.dml_navigation_update(
	id_user_ numeric,
	_id_navigation numeric,
	_id_company numeric,
	_name_navigation character varying,
	_description_navigation character varying,
	_type_navigation core."TYPE_NAVIGATION",
	_status_navigation boolean,
	_content_navigation json,
	_deleted_navigation boolean)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_navigation_update(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_navigation_update_modified(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
-- DROP FUNCTION IF EXISTS core.dml_navigation_update_modified(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean);

CREATE OR REPLACE FUNCTION core.dml_navigation_update_modified(
	id_user_ numeric,
	_id_navigation numeric,
	_id_company numeric,
	_name_navigation character varying,
	_description_navigation character varying,
	_type_navigation core."TYPE_NAVIGATION",
	_status_navigation boolean,
	_content_navigation json,
	_deleted_navigation boolean)
    RETURNS TABLE(id_navigation numeric, id_company numeric, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json, deleted_navigation boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_navigation_update_modified(numeric, numeric, numeric, character varying, character varying, core."TYPE_NAVIGATION", boolean, json, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_create(numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_profile_create(numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_profile_create(
	id_user_ numeric,
	_id_company numeric,
	_type_profile core."TYPE_PROFILE",
	_name_profile character varying,
	_description_profile character varying,
	_status_profile boolean,
	_deleted_profile boolean)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_profile_create(numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_create_modified(numeric)
-- DROP FUNCTION IF EXISTS core.dml_profile_create_modified(numeric);

CREATE OR REPLACE FUNCTION core.dml_profile_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_profile numeric, id_company numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, deleted_profile boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_profile_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_update(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_profile_update(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_profile_update(
	id_user_ numeric,
	_id_profile numeric,
	_id_company numeric,
	_type_profile core."TYPE_PROFILE",
	_name_profile character varying,
	_description_profile character varying,
	_status_profile boolean,
	_deleted_profile boolean)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_profile_update(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_update_modified(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_profile_update_modified(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_profile_update_modified(
	id_user_ numeric,
	_id_profile numeric,
	_id_company numeric,
	_type_profile core."TYPE_PROFILE",
	_name_profile character varying,
	_description_profile character varying,
	_status_profile boolean,
	_deleted_profile boolean)
    RETURNS TABLE(id_profile numeric, id_company numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, deleted_profile boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_profile_update_modified(numeric, numeric, numeric, core."TYPE_PROFILE", character varying, character varying, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_delete_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_profile_delete_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_profile_delete_modified(
	id_user_ numeric,
	_id_profile numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_profile_delete_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_navigation_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_profile_navigation_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_profile_navigation_create_modified(
	id_user_ numeric,
	_id_profile numeric)
    RETURNS TABLE(id_profile_navigation numeric, id_profile numeric, id_navigation numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_profile_navigation_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_profile_navigation_update_modified(numeric, numeric, numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_profile_navigation_update_modified(numeric, numeric, numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_profile_navigation_update_modified(
	id_user_ numeric,
	_id_profile_navigation numeric,
	_id_profile numeric,
	_id_navigation numeric)
    RETURNS TABLE(id_profile_navigation numeric, id_profile numeric, id_navigation numeric, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean, name_navigation character varying, description_navigation character varying, type_navigation core."TYPE_NAVIGATION", status_navigation boolean, content_navigation json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_profile_navigation_update_modified(numeric, numeric, numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_user_create(numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_user_create(numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_user_create(
	id_user_ numeric,
	_id_company numeric,
	_id_person numeric,
	_id_profile numeric,
	_type_user core."TYPE_USER",
	_name_user character varying,
	_password_user character varying,
	_avatar_user character varying,
	_status_user boolean,
	_deleted_user boolean)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_user_create(numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_user_create_modified(numeric)
-- DROP FUNCTION IF EXISTS core.dml_user_create_modified(numeric);

CREATE OR REPLACE FUNCTION core.dml_user_create_modified(
	id_user_ numeric)
    RETURNS TABLE(id_user numeric, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, deleted_user boolean, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, title_academic character varying, abbreviation_academic character varying, nivel_academic character varying, name_job character varying, address_job character varying, phone_job character varying, position_job character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
							_ID_PROFILE = (select vp.id_profile from core.view_profile vp order by vp.id_profile desc limit 1);
							
							IF (_ID_PROFILE >= 1) THEN
								_ID_USER = (select * from core.dml_user_create(id_user_, _ID_COMPANY, _ID_PERSON, _ID_PROFILE, 'student', 'new.user@tsantsa.com', '', 'default.svg', false, false));
								
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
			
$BODY$;

ALTER FUNCTION core.dml_user_create_modified(numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_user_update(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean)
-- DROP FUNCTION IF EXISTS core.dml_user_update(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean);

CREATE OR REPLACE FUNCTION core.dml_user_update(
	id_user_ numeric,
	_id_user numeric,
	_id_company numeric,
	_id_person numeric,
	_id_profile numeric,
	_type_user core."TYPE_USER",
	_name_user character varying,
	_password_user character varying,
	_avatar_user character varying,
	_status_user boolean,
	_deleted_user boolean)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_user_update(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_user_update_modified(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean, numeric, numeric, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying)
-- DROP FUNCTION IF EXISTS core.dml_user_update_modified(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean, numeric, numeric, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION core.dml_user_update_modified(
	id_user_ numeric,
	_id_user numeric,
	_id_company numeric,
	_id_person numeric,
	_id_profile numeric,
	_type_user core."TYPE_USER",
	_name_user character varying,
	_password_user character varying,
	_avatar_user character varying,
	_status_user boolean,
	_deleted_user boolean,
	_id_academic numeric,
	_id_job numeric,
	_dni_person character varying,
	_name_person character varying,
	_last_name_person character varying,
	_address_person character varying,
	_phone_person character varying,
	_title_academic character varying,
	_abbreviation_academic character varying,
	_nivel_academic character varying,
	_name_job character varying,
	_address_job character varying,
	_phone_job character varying,
	_position_job character varying)
    RETURNS TABLE(id_user numeric, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, deleted_user boolean, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, title_academic character varying, abbreviation_academic character varying, nivel_academic character varying, name_job character varying, address_job character varying, phone_job character varying, position_job character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_user_update_modified(numeric, numeric, numeric, numeric, numeric, core."TYPE_USER", character varying, character varying, character varying, boolean, boolean, numeric, numeric, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: core.dml_user_delete_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_user_delete_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_user_delete_modified(
	id_user_ numeric,
	_id_user numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_user_delete_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_session_create(numeric, numeric, character varying, json, timestamp without time zone, timestamp without time zone, boolean)
-- DROP FUNCTION IF EXISTS core.dml_session_create(numeric, numeric, character varying, json, timestamp without time zone, timestamp without time zone, boolean);

CREATE OR REPLACE FUNCTION core.dml_session_create(
	id_user_ numeric,
	_id_user numeric,
	_host_session character varying,
	_agent_session json,
	_date_sign_in_session timestamp without time zone,
	_date_sign_out_session timestamp without time zone,
	_status_session boolean)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			
$BODY$;

ALTER FUNCTION core.dml_session_create(numeric, numeric, character varying, json, timestamp without time zone, timestamp without time zone, boolean)
    OWNER TO postgres;

-- FUNCTION: core.dml_session_release(numeric)
-- DROP FUNCTION IF EXISTS core.dml_session_release(numeric);

CREATE OR REPLACE FUNCTION core.dml_session_release(
	_id_session numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_session_release(numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_session_by_session_release(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_session_by_session_release(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_session_by_session_release(
	id_user_ numeric,
	_id_session numeric)
    RETURNS TABLE(id_session_ numeric, id_user numeric, host_session character varying, agent_session json, date_sign_in_session timestamp without time zone, date_sign_out_session timestamp without time zone, status_session boolean, id_company numeric, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_setting numeric, name_company character varying, status_company boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying, type_profile core."TYPE_PROFILE", name_profile character varying, description_profile character varying, status_profile boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_session_by_session_release(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_session_by_user_release_all(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_session_by_user_release_all(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_session_by_user_release_all(
	id_user_ numeric,
	_id_user numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_session_by_user_release_all(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_session_by_company_release_all(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_session_by_company_release_all(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_session_by_company_release_all(
	id_user_ numeric,
	_id_company numeric)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.dml_session_by_company_release_all(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_newsletter_create_modified(numeric, numeric)
-- DROP FUNCTION IF EXISTS core.dml_newsletter_create_modified(numeric, numeric);

CREATE OR REPLACE FUNCTION core.dml_newsletter_create_modified(
	id_user_ numeric,
	_id_company numeric)
    RETURNS TABLE(id_newsletter numeric, id_company numeric, id_user numeric, name_newsletter character varying, description_newsletter character varying, date_newsletter timestamp with time zone, deleted_newsletter boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			DECLARE
				_ID_NEWSLETTER NUMERIC;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			BEGIN
				_ID_NEWSLETTER = (select * from core.dml_newsletter_create(id_user_, _id_company, id_user_, 'Nuevo anuncio', '', now()::timestamp, false));

				IF (_ID_NEWSLETTER >= 1) THEN
					RETURN QUERY select cvn.id_newsletter, cvn.id_company, cvn.id_user, cvn.name_newsletter, cvn.description_newsletter, cvn.date_newsletter, cvn.deleted_newsletter, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person  from core.view_newsletter cvn
						inner join core.view_user cvu on cvn.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where cvn.id_newsletter = _ID_NEWSLETTER;
				ELSE
					_EXCEPTION = 'Ocurrió un error al ingresar newsletter';
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

ALTER FUNCTION core.dml_newsletter_create_modified(numeric, numeric)
    OWNER TO postgres;

-- FUNCTION: core.dml_newsletter_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
-- DROP FUNCTION IF EXISTS core.dml_newsletter_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean);

CREATE OR REPLACE FUNCTION core.dml_newsletter_update_modified(
	id_user_ numeric,
	_id_newsletter numeric,
	_id_company numeric,
	_id_user numeric,
	_name_newsletter character varying,
	_description_newsletter character varying,
	_date_newsletter timestamp with time zone,
	_deleted_newsletter boolean)
    RETURNS TABLE(id_newsletter numeric, id_company numeric, id_user numeric, name_newsletter character varying, description_newsletter character varying, date_newsletter timestamp with time zone, deleted_newsletter boolean, id_person numeric, id_profile numeric, type_user core."TYPE_USER", name_user character varying, password_user character varying, avatar_user character varying, status_user boolean, id_academic numeric, id_job numeric, dni_person character varying, name_person character varying, last_name_person character varying, address_person character varying, phone_person character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
			 DECLARE
			 	_UPDATE_NEWSLETTER BOOLEAN;
				_EXCEPTION TEXT DEFAULT 'Internal Error';
			 BEGIN
			 	_UPDATE_NEWSLETTER = (select * from core.dml_newsletter_update(id_user_, _id_newsletter, _id_company, _id_user, _name_newsletter, _description_newsletter, _date_newsletter, _deleted_newsletter));

			 	IF (_UPDATE_NEWSLETTER) THEN
					RETURN QUERY select cvn.id_newsletter, cvn.id_company, cvn.id_user, cvn.name_newsletter, cvn.description_newsletter, cvn.date_newsletter, cvn.deleted_newsletter, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person  from core.view_newsletter cvn
						inner join core.view_user cvu on cvn.id_user = cvu.id_user
						inner join core.view_person cvp on cvu.id_person = cvp.id_person
						where cvn.id_newsletter = _id_newsletter; 
				ELSE
					_EXCEPTION = 'Ocurrió un error al actualizar newsletter';
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

ALTER FUNCTION core.dml_newsletter_update_modified(numeric, numeric, numeric, numeric, character varying, character varying, timestamp with time zone, boolean)
    OWNER TO postgres;
