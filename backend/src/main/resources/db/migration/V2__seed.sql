insert into auth_user (username, password_hash, full_name, active, roles) values
('admin', '$2b$12$zw5kPo7oqQ9SpKddzV5y..ck25atFS1rTTHjkhOqi5meKoeOoKKJO', 'Administrador de Seguridad', true, 'ROLE_ADMIN');

insert into t95_par02 (cod_grupo_usuario, cod_parametro, descripcion) values
('GR', 'ADM', 'Administrador'),
('GR', 'USR', 'Usuario estándar');

insert into t01_gre20 (perfil, descripcion) values
('ADM', 'Administrador'),
('USR', 'Usuario estándar');

insert into t06_tc005 (empresa, descripcion) values
('0001', 'Empresa 1'),
('0002', 'Empresa 2');

insert into t06_tc007 (empresa, centro, descripcion) values
('0001', '0001', 'Centro 1-1'),
('0001', '0002', 'Centro 1-2'),
('0002', '0001', 'Centro 2-1');

insert into t95_usu03 (usr_siglo21, usr_nombre, usr_status, usr_cid, usr_offset, usr_cargo, usr_empresa, usr_centro, usr_pers, usr_dominio, usr_nodo, usr_autoriza, usr_updfch, usr_updtime, usr_updusr, usr_updterm, usr_fchlogon, usr_timelogon, usr_token, usr_historia, usr_fchnewpass, usr_fchcambio, usr_oficina_swift) values
('USR00001', 'Juan Perez', 'N', '0102030405', '00000001', 'Supervisor', '0001', '0001', 'ADM', 'DOM1', 'NOD1', '1', '20260327', '120000', 'admin', 'T001', '20260327', '080000', 'ABC12345', 'Usuario semilla', '20260327', '20260327', 'MSQUTODO'),
('USR00002', 'Maria Lopez', 'N', '0203040506', '00000002', 'Analista', '0001', '0002', 'USR', 'DOM1', 'NOD1', '0', '20260327', '120000', 'admin', 'T001', '20260327', '080000', 'XYZ98765', 'Usuario semilla', '20260327', '20260327', null);

insert into t95_obs04 (usr_siglo21, observacion) values
('USR00001', 'Usuario semilla para pruebas'),
('USR00002', 'Usuario semilla para pruebas');

insert into t95_ban04 (usr_siglo21, usuario_bancs, terminal_bancs, estado_proceso) values
('USR00001', '12345678', '54321', 'AC');
