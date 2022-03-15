------------------------------ README ------------------------------
-- Estas son funciones experimentales, las cuales se han desarrollado para que funcionen de manera general
-- Para que no tenga poblemas al momento de ejecutarlas, se tiene que seguir la siguiente normalizacion
-- Para el nombrado de las entidades se debe usar snake_case (LOWER)
-- Las llaves primarias tienen que nombrarse de la siguiente manera ejem: tabla user - PK - id_user
-- Las llaves primarias tienen que ocupara la primera posicion ordinal en la tabla que se encuentran.
-- Si la tabla tiene llaves primarias compuestas no hay problema ya que esta implementacion no toma en cuenta estos casos

-- Definición de las funciones para crear vistas, secuencias, funciones CRUD

------------------------------ UTILS ------------------------------
-- FUNCTION: dev.utils_limit_number(numeric)
-- DROP FUNCTION dev.utils_limit_number(numeric);

CREATE OR REPLACE FUNCTION dev.utils_limit_number(
	digitos numeric)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_NUMBER_CHARACTER TEXT DEFAULT '';
	_X RECORD;
	
BEGIN
	FOR _X IN 1..$1 LOOP
		_NUMBER_CHARACTER = ''||_NUMBER_CHARACTER||'9';
    END LOOP;
	return _NUMBER_CHARACTER::numeric;
END;
$BODY$;

ALTER FUNCTION dev.utils_limit_number(numeric)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_columns(character varying, character varying)
-- DROP FUNCTION dev.utils_get_columns(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_columns(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_COLUMNS TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS = ''||_COLUMNS||' '||_X.column_name||',';
	END LOOP;
	return (select substring(_COLUMNS from 2 for (char_length(_COLUMNS)-2)));
END;
$BODY$;

ALTER FUNCTION dev.utils_get_columns(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_columns_alias(character varying, character varying)
-- DROP FUNCTION dev.utils_get_columns_alias(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_columns_alias(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_COLUMNS_ALIAS TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS_ALIAS = ''||_COLUMNS_ALIAS||' t.'||_X.column_name||',';
	END LOOP;
	return (select substring(_COLUMNS_ALIAS from 2 for (char_length(_COLUMNS_ALIAS)-2)));
END;
$BODY$;

ALTER FUNCTION dev.utils_get_columns_alias(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_columns_type(character varying, character varying)
-- DROP FUNCTION dev.utils_get_columns_type(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_columns_type(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_COLUMNS_TYPE TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' order by c.ordinal_position asc'  LOOP
		_COLUMNS_TYPE = ''||_COLUMNS_TYPE||' '||_X.column_name||' '||_X.data_type||',';
	END LOOP;
	return (select substring(_COLUMNS_TYPE from 2 for (char_length(_COLUMNS_TYPE)-2)));
END;
$BODY$;

ALTER FUNCTION dev.utils_get_columns_type(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_columns_backend(character varying, character varying)
-- DROP FUNCTION dev.utils_get_columns_backend(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_columns_backend(
	_schema character varying,
	_table_name character varying)
    RETURNS TABLE(column_name_ character varying, column_type_ character varying, length_character_ numeric, lenght_numeric_ numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
BEGIN
		RETURN QUERY SELECT cast(c.column_name as character varying), cast(c.data_type as character varying), cast(c.character_maximum_length as numeric), cast(c.numeric_precision as numeric) FROM information_schema.columns c WHERE c.table_schema = ''||$1||'' and c.table_name = ''||$2||'' order by c.ordinal_position asc; 
END;
$BODY$;

ALTER FUNCTION dev.utils_get_columns_backend(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_param_delete(character varying, character varying)
-- DROP FUNCTION dev.utils_get_param_delete(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_param_delete(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_PARAM_DELETE TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.column_name, c.data_type FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' and c.ordinal_position = 1'  LOOP
		_PARAM_DELETE = ''||_PARAM_DELETE||' _'||UPPER(_X.column_name)||' '||_X.data_type||',';
    END LOOP;
	return (select substring(_PARAM_DELETE from 2 for (char_length(_PARAM_DELETE)-2)));
END;
$BODY$;

ALTER FUNCTION dev.utils_get_param_delete(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_params(character varying, character varying)
-- DROP FUNCTION dev.utils_get_params(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_params(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.utils_get_params(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_params_exclude_id(character varying, character varying)
-- DROP FUNCTION dev.utils_get_params_exclude_id(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_params_exclude_id(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.utils_get_params_exclude_id(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_query_update(character varying, character varying)
-- DROP FUNCTION dev.utils_get_query_update(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_get_query_update(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.utils_get_query_update(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.utils_get_values_insert(character varying, character varying, numeric)
-- DROP FUNCTION dev.utils_get_values_insert(character varying, character varying, numeric);

CREATE OR REPLACE FUNCTION dev.utils_get_values_insert(
	_schema character varying,
	_table_name character varying,
	_increment numeric)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_VALUES_INSERT TEXT DEFAULT '';
	_X RECORD;
BEGIN
	FOR _X IN EXECUTE 'SELECT c.ordinal_position FROM information_schema.columns c WHERE c.table_schema = '''||$1||''' and c.table_name = '''||$2||''' and c.ordinal_position != 1 order by c.ordinal_position asc'  LOOP
		_VALUES_INSERT = ''||_VALUES_INSERT||' $'||(_X.ordinal_position)- $3||' ,';
    END LOOP;
	return (select substring(_VALUES_INSERT from 2 for (char_length(_VALUES_INSERT)-2)));
END;
$BODY$;

ALTER FUNCTION dev.utils_get_values_insert(character varying, character varying, numeric)
    OWNER TO postgres;

-- FUNCTION: dev.utils_table_exists(character varying, character varying)
-- DROP FUNCTION dev.utils_table_exists(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_table_exists(
	_schema character varying,
	_table_name character varying)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
BEGIN
	return (SELECT count(*) FROM information_schema.tables t WHERE t.table_type = 'BASE TABLE' and t.table_schema = ''||$1||'' and t.table_name = ''||$2||'');
END;
$BODY$;

ALTER FUNCTION dev.utils_table_exists(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: core.utils_get_table_dependency(character varying, character varying, numeric)
-- DROP FUNCTION core.utils_get_table_dependency(character varying, character varying, numeric);

CREATE OR REPLACE FUNCTION core.utils_get_table_dependency(
	_schema character varying,
	_table_name character varying,
	_id_deleted numeric)
    RETURNS numeric
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
			 
$BODY$;

ALTER FUNCTION core.utils_get_table_dependency(character varying, character varying, numeric)
    OWNER TO postgres;

-- FUNCTION: dev.utils_generate_external_id_validation(character varying, character varying)
-- DROP FUNCTION IF EXISTS dev.utils_generate_external_id_validation(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.utils_generate_external_id_validation(
	_schema character varying,
	_table_name character varying)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.utils_generate_external_id_validation(character varying, character varying)
    OWNER TO postgres;

------------------------------ Funciones DDL ------------------------------
-- FUNCTION: dev.ddl_config(character varying)
-- DROP FUNCTION dev.ddl_config(character varying);

CREATE OR REPLACE FUNCTION dev.ddl_config(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_config(character varying)
    OWNER TO postgres;

-- FUNCTION: dev.ddl_create_crud(character varying, character varying, character varying)
-- DROP FUNCTION dev.ddl_create_crud(character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION dev.ddl_create_crud(
	_schema character varying,
	_table_name character varying,
	_duplicate_handler_attribute character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_create_crud(character varying, character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.ddl_create_crud_modified(character varying, character varying)
-- DROP FUNCTION dev.ddl_create_crud_modified(character varying, character varying);

CREATE OR REPLACE FUNCTION dev.ddl_create_crud_modified(
	_schema character varying,
	_table_name character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_create_crud_modified(character varying, character varying)
    OWNER TO postgres;

-- FUNCTION: dev.ddl_create_sequences(character varying)
-- DROP FUNCTION dev.ddl_create_sequences(character varying);

CREATE OR REPLACE FUNCTION dev.ddl_create_sequences(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_create_sequences(character varying)
    OWNER TO postgres;

-- FUNCTION: dev.ddl_create_view(character varying)
-- DROP FUNCTION dev.ddl_create_view(character varying);

CREATE OR REPLACE FUNCTION dev.ddl_create_view(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_create_view(character varying)
    OWNER TO postgres;

-- FUNCTION: dev.ddl_createall_crud(character varying)
-- DROP FUNCTION dev.ddl_createall_crud(character varying);

CREATE OR REPLACE FUNCTION dev.ddl_createall_crud(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.ddl_createall_crud(character varying)
    OWNER TO postgres;

------------------------------ FUNCIONES DML ------------------------------
-- FUNCTION: dev.dml_reset_sequences(character varying)
-- DROP FUNCTION dev.dml_reset_sequences(character varying);

CREATE OR REPLACE FUNCTION dev.dml_reset_sequences(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION dev.dml_reset_sequences(character varying)
    OWNER TO postgres;

-- FUNCTION: dev.dml_truncateall(character varying)
-- DROP FUNCTION dev.dml_truncateall(character varying);

CREATE OR REPLACE FUNCTION dev.dml_truncateall(
	_schema character varying)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	_X RECORD;
BEGIN
        FOR _X IN (select table_name from information_schema.tables t where t.table_schema = ''||_SCHEMA||'' and t.table_type = 'BASE TABLE') LOOP
			EXECUTE 'TRUNCATE TABLE '||$1||'.'||_X.table_name||' CASCADE';
        END LOOP;
        RETURN true;
END;
$BODY$;

ALTER FUNCTION dev.dml_truncateall(character varying)
    OWNER TO postgres;

------------------------------ CORE SCHEME ------------------------------
------------------------------ VARIABLES GLOABLES --------------------------------

CREATE OR REPLACE FUNCTION core.global_save_log(
	)
    RETURNS boolean
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  	_STATE_SAVE_LOGS BOOLEAN DEFAULT true;
	BEGIN	
		RETURN _STATE_SAVE_LOGS;
	END;
$BODY$;

ALTER FUNCTION core.global_save_log()
    OWNER TO postgres;

------------------------------ SECURITY CAP ------------------------------

-- ENABLED pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA core;

-- FUNCTION: core.global_encryption_password()
-- DROP FUNCTION core.global_encryption_password();

CREATE OR REPLACE FUNCTION core.global_encryption_password(
	)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
	-- (OJO) LA CONTRASEÑA TIENE QUE SER DE 16 DIGITOS --
  	_PASSWORD TEXT DEFAULT 'eNcR$TsAnTs$2022';
	BEGIN
		RETURN _PASSWORD;
	END;
$BODY$;

ALTER FUNCTION core.global_encryption_password()
    OWNER TO postgres;

-- FUNCTION: core.security_cap_string_invert(character varying)
-- DROP FUNCTION core.security_cap_string_invert(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_string_invert(
	_string character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION core.security_cap_string_invert(character varying)
    OWNER TO postgres;

-- FUNCTION: core.security_cap_string_position_invert(character varying)
-- DROP FUNCTION core.security_cap_string_position_invert(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_string_position_invert(
	_string character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION core.security_cap_string_position_invert(character varying)
    OWNER TO postgres;

-- FUNCTION: core.security_cap_encrypt(character varying)
-- DROP FUNCTION core.security_cap_encrypt(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_algorithm_encrypt(
	_text character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  	_STRING_INVERT TEXT DEFAULT '';
	_STRING_POSITION_INVERT TEXT DEFAULT '';
	BEGIN	
		_STRING_INVERT = (select * from core.security_cap_string_invert(_text));
		_STRING_POSITION_INVERT = (select * from core.security_cap_string_position_invert(_STRING_INVERT));
		RETURN _STRING_POSITION_INVERT;
	END;
$BODY$;

ALTER FUNCTION core.security_cap_algorithm_encrypt(character varying)
    OWNER TO postgres;

-- FUNCTION: core.security_cap_decrypt(character varying)
-- DROP FUNCTION core.security_cap_decrypt(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_algorithm_decrypt(
	_string_position_invert character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
  	_STRING_INVERT TEXT DEFAULT '';
	_TEXT TEXT DEFAULT '';
	BEGIN	
		_STRING_INVERT = (select * from core.security_cap_string_position_invert(_string_position_invert));
		_TEXT = (select * from core.security_cap_string_invert(_STRING_INVERT));
		RETURN _TEXT;
	END;
$BODY$;

ALTER FUNCTION core.security_cap_algorithm_decrypt(character varying)
    OWNER TO postgres;

-- FUNCTION: core.security_cap_string_encrypt(character varying)
-- DROP FUNCTION core.security_cap_string_encrypt(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_aes_encrypt(
	_text character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION core.security_cap_aes_encrypt(character varying)
    OWNER TO postgres;

-- FUNCTION: core.security_cap_string_decrypt(character varying)
-- DROP FUNCTION core.security_cap_string_decrypt(character varying);

CREATE OR REPLACE FUNCTION core.security_cap_aes_decrypt(
	_text_encrypted character varying)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
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
$BODY$;

ALTER FUNCTION core.security_cap_aes_decrypt(character varying)
    OWNER TO postgres;


