-- View: core.view_validation_inner_company_user
-- DROP VIEW core.view_validation_inner_company_user;

CREATE OR REPLACE VIEW core.view_validation_inner_company_user
 AS
 SELECT vv.id_validation,
    vv.id_company,
    vv.type_validation,
    vv.status_validation,
    vv.pattern_validation,
    vv.message_validation,
    vv.deleted_validation,
    vu.name_user
   FROM core.view_validation vv
     JOIN core.view_company vc ON vv.id_company = vc.id_company
     JOIN core.view_user vu ON vu.id_company = vc.id_company
  WHERE vv.status_validation = true;

ALTER TABLE core.view_validation_inner_company_user
    OWNER TO postgres;

