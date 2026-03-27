      ****************************************************************
      **                        N E X T I                           **
      ****************************************************************
      **                                                            **
      **  DESCRIPCION...: Operaciones funcionales a la tabla de     **
      **                  usuarios                                  **
      **                                                            **
      ****************************************************************
       IDENTIFICATION DIVISION.
       PROGRAM-ID.  SSITP007.
       AUTHOR.      STALYN MELO.
      *************************************************************
      *    ADMINISTRACION DE USUARIOS                             *
      *************************************************************
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER.  IBM-4331.
       OBJECT-COMPUTER.  IBM-4331.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       77  ITEMNUM          PIC S9(4) COMP.
       77  W-EMPWORK        PIC X(4)  VALUE SPACES.
       77  W-CONEMPRESA     PIC X(4)  VALUE SPACES.
       77  W-SOLICI         PIC X(50) VALUE SPACES.
       77  BDK-TEXT         PIC X(08) VALUE SPACES.
       77  W-RESPUESTA      PIC X(30) VALUE SPACES.
       77  W-CODRES         PIC X(03) VALUE SPACES.
       01  W-PASSWORD       PIC X(8).
       01  W-TIPO           PIC X.
       01  W-ESWT           PIC X VALUE '9'.
       01  W-RESULTADO  PIC 9(02) VALUE ZEROS.
       01  R-DATOS-INPUT.
           03 INPUT-DATOS-ENTRADA.
              05 INPUT-FUNCION          PIC X.
              05 INPUT-DATA             PIC X(16).
              05 FILLER REDEFINES INPUT-DATA.
                 10 INPUT-DAT01         PIC X(08).
                 10 INPUT-DAT02         PIC X(08).
            03 INPUT-DATOS-SALIDA.
              05 INPUT-SALIDA           PIC X(16).
              05 FILLER REDEFINES INPUT-SALIDA.
                 10 INPUT-SAL01         PIC X(08).
                 10 INPUT-SAL02         PIC X(08).
       01  W-DATKEY16          PIC X(16) VALUE SPACES.
       01  W-REGI-006          PIC X(354) VALUE SPACES.
       01  FILLER REDEFINES W-REGI-006.
           02 R006-SIGLO21     PIC X(16).
           02 R006-OFFSET      PIC X(16).
           02 R006-NUMKEY      PIC X(02).
           02 R006-HISTORIA    PIC X(320).
           02 FILLER REDEFINES R006-HISTORIA.
              04 R006-HKEY OCCURS 20 PIC X(16).
       01  W-FCHCAMBIO         PIC 9(08) VALUE ZEROS.
       01  FILLER REDEFINES W-FCHCAMBIO.
           02 FCH-ANO          PIC 9(04).
           02 FCH-MES          PIC 9(02).
           02 FCH-DIA          PIC 9(02).
       01  WS-HORA             PIC 9(06) VALUE ZEROS.
       01  FILLER REDEFINES WS-HORA.
           02 UDP-HOR          PIC 9(02).
           02 UDP-MIN          PIC 9(02).
           02 UDP-SEG          PIC 9(02).
       01  WS-RESPUESTA        PIC X(30).                                                              
       01  FILLER REDEFINES WS-RESPUESTA.
           02 TXT-RESP         PIC X(24).
           02 NUM-RESP         PIC 9(06).

       01  W-QNAME.
           05 W-QUSER              PIC X(8).
       01  W-FLAG                  PIC X.
       01  W-DETALLE               PIC X(40).
       01  W-TERMINAL              PIC X(15).
       01  W-CENTOFC               PIC X(04).
       01  W-NUMROWS               PIC S9(5) COMP-3.
       01  W-DEL                   PIC X VALUE ';'.
       77  W-PERFIL                PIC X(08) VALUE SPACES.
       77  W-BANDERA               PIC X    VALUE SPACES.
       77  W-STATUS                PIC X(3) VALUE SPACES.
       77  W-LEN                   PIC S9(4) BINARY.
       77  W-USERID                PIC X(8) VALUE SPACES.
       77  W-APPLID                PIC X(8) VALUE SPACES.
       77  MENSAJE                 PIC X(14) VALUE SPACES.
       77  GRABA-T001              PIC X     VALUE SPACE.
       77  NO-AUTORIZADO           PIC X     VALUE SPACE.
       77  RESPUESTA               PIC X(40) VALUE SPACES.
       77  FUNCION                 PIC 9(04) VALUE ZEROS.
       77  NUMERO-FORMULA          PIC 9(06) VALUE ZEROS.
       77  W-USER PIC X(8).
       77  W-RESP PIC S9(8) BINARY.
       77  W-RESP2 PIC S9(8) BINARY.
       01  W-LONG PIC S9(4) BINARY.
       01  W-REGISTRO    PIC X(720) VALUE SPACES.
       01  FILLER REDEFINES W-REGISTRO.
           05 W-QUSRID OCCURS 40 PIC X(18).
       01  W-ITEM PIC S9(4) BINARY.
       01  W-INDICE  PIC 9(02).
       01  W-DONDE   PIC 9(02).
       01  W-I       PIC 9(02).
       01  W-ESTA    PIC X.
       01  LOG-PERS      PIC X(08)  VALUE SPACES.
       01  LOG-CENTRO    PIC X(04)  VALUE SPACES.
       01  LOG-AUTORIZA  PIC 9      VALUE ZEROS.
       01  W-REGIS-AUX   PIC X(18) VALUE SPACES.
       01  FILLER REDEFINES W-REGIS-AUX.
           05 W-USRID-AUX PIC X(08).
           05 W-CID-AUX PIC X(10).
       01  W-QCENTRO.
           05 W-EMPRESA PIC X(4).
           05 W-CENTRO  PIC X(4).
       01  PUNTERO USAGE IS POINTER.
       01  PUNTERON REDEFINES PUNTERO PIC S9(8) COMP.
       01  W-REGIS-PERF   PIC X(18) VALUE SPACES.
       01  FILLER REDEFINES W-REGIS-PERF.
           05 W-USRID-PERF PIC X(08).
           05 W-CID-PERF PIC X(10).
       01  W-QPERFIL    PIC X(16) VALUE SPACES.
       01  FILLER REDEFINES W-QPERFIL.
           05 W-PERNOM  PIC X(8).
           05 W-PEREMP  PIC X(4).
           05 W-PERCEN  PIC X(4).
       01  W-REGIPERF    PIC X(720) VALUE SPACES.
       01  FILLER REDEFINES W-REGIPERF.
           05 W-PUSRID OCCURS 40 PIC X(18).
       01  BDK-PUNTERO1            USAGE IS POINTER.
       01  WS-A                    PIC X VALUE LOW-VALUE.
           COPY INPRG015.
           COPY INPRG008.
           COPY INSSI011.
           COPY BFCHTIME.
           COPY SSIM007.
           COPY DFHAID.
       01  TERMINAL-BANCS               PIC X(05).
       01  TERMNO-BANCS REDEFINES TERMINAL-BANCS PIC 9(5).
       01  USR-HOM-BANCS                PIC X(08).
       01  EST-HOM-PROC                 PIC X(08).
       01  R-T95LOG01.
           05 T95LOG01-NUM-PUESTO       PIC X(08).
           05 T95LOG01-TRANSACCION      PIC X(10).
           05 T95LOG01-OPERACION        PIC X(10).
           05 T95LOG01-FECHA-INGRESO    PIC X(26).
           05 T95LOG01-TERMINAL         PIC X(10).
           05 T95LOG01-COD-USUARIO-MOD  PIC X(20).
           05 T95LOG01-MENSAJERIA       PIC X(100).
           05 T95LOG01-CMP-OBSERVACION  PIC X(100).
       01  R-T01GRE20.
           05 T01GRE20-COD-GRUPO-USUARIO    PIC X(08).
           05 T01GRE20-COD-RECURSO          PIC X(12).
           05 T01GRE20-COD-ACCESO           PIC S9(04) COMP-3.
           05 T01GRE20-COD-USUARIO-MOD      PIC X(08).
           05 T01GRE20-TIM-MODIFICACION     PIC X(26).
       01  R-T95PAR02.
           05 T95PAR02-COD-GRUPO-USUARIO    PIC X(12).
           05 T95PAR02-COD-PARAMETRO        PIC X(04).
           05 T95PAR02-DESCRIPCION          PIC X(100).
       01  R-T06TC007.
           10 T06-COD-EMPRESA          PIC X(4).
           10 T06-COD-CENTRO           PIC X(4).
           10 T06-NOMBRE               PIC X(40).
           10 T06-COD-TIPO-VIA         PIC X(3).
           10 T06-NOM-VIA              PIC X(40).
           10 T06-NUM-VIA              PIC X(10).
           10 T06-CODIGO-POSTAL        PIC S9(5)V USAGE COMP-3.
           10 T06-COD-PUEBLO           PIC X(4).
           10 T06-COD-MUNICIPIO        PIC X(3).
           10 T06-COD-PROVINCIA        PIC X(2).
           10 T06-COD-PAIS             PIC X(4).
           10 T06-PREFIJO-TF           PIC S9(3)V USAGE COMP-3.
           10 T06-NUM-TELEFONO         PIC S9(10)V USAGE COMP-3.
           10 T06-NUM-FAX              PIC S9(10)V USAGE COMP-3.
           10 T06-DEC-JUZGA-TRIBUNA    PIC X(20).
           10 T06-IND-ACTIVIDAD        PIC X(1).
           10 T06-FEC-INIC-VALIDEZ     PIC X(10).
           10 T06-FEC-FINALVALIDEZ     PIC X(10).
           10 T06-TIMESTAMP-SIGLO      PIC X(26).
           10 T06-COD-USU-MODIF        PIC X(8).
       01  T06TC005.
           10 T0605-COD-EMPRESA          PIC X(4).
           10 T0605-NOMBRE               PIC X(40).
           10 T0605-COD-NUM-DOC-OFICIA   PIC X(14).
           10 T0605-TIMESTAMP-SIGLO      PIC X(26).
           10 T0605-COD-USU-MODIF        PIC X(8).
      ******************************************************************
      * COBOL DECLARATION FOR TABLE T06TC005                           *
      ******************************************************************
           EXEC SQL
              INCLUDE SQLCA
           END-EXEC.
           EXEC SQL
              INCLUDE T95OBS04
           END-EXEC.
           EXEC SQL
              DECLARE M2D.T01GRE20 TABLE
                 (COD_GRUPO_USUARIO CHAR(8) NOT NULL,
                  COD_RECURSO CHAR(12) NOT NULL,
                  COD_ACCESO DECIMAL(4,0) NOT NULL,
                  COD_USUARIO_MOD CHAR(8) NOT NULL,
                  TIM_MODIFICACION CHAR(26) NOT NULL)
           END-EXEC.
           EXEC SQL
              DECLARE M2D.T95PAR02 TABLE
                 (COD_GRUPO_USUARIO CHAR(12) NOT NULL,
                  COD_PARAMETRO CHAR(4) NOT NULL,
                  DESCRIPCION CHAR(100) NOT NULL)
           END-EXEC.
           EXEC SQL DECLARE M2D.T06TC007 TABLE
           ( COD_EMPRESA                    CHAR(4) NOT NULL,
             COD_CENTRO                     CHAR(4) NOT NULL,
             NOMBRE                         CHAR(40) NOT NULL,
             COD_TIPO_VIA                   CHAR(3) NOT NULL,
             NOM_VIA                        CHAR(40) NOT NULL,
             NUM_VIA                        CHAR(10) NOT NULL,
             CODIGO_POSTAL                  DECIMAL(5, 0) NOT NULL,
             COD_PUEBLO                     CHAR(4) NOT NULL,
             COD_MUNICIPIO                  CHAR(3) NOT NULL,
             COD_PROVINCIA                  CHAR(2) NOT NULL,
             COD_PAIS                       CHAR(4) NOT NULL,
             PREFIJO_TF                     DECIMAL(3, 0) NOT NULL,
           NUM_TELEFONO                   DECIMAL(10, 0) NOT NULL,
             NUM_FAX                        DECIMAL(10, 0) NOT NULL,
             DEC_JUZGA_TRIBUNA              CHAR(20) NOT NULL,
             IND_ACTIVIDAD                  CHAR(1) NOT NULL,
             FEC_INIC_VALIDEZ               DATE NOT NULL,
             FEC_FINALVALIDEZ               DATE NOT NULL,
             TIMESTAMP_SIGLO                TIMESTAMP NOT NULL,
             COD_USU_MODIF                  CHAR(8) NOT NULL
           ) END-EXEC.
           EXEC SQL DECLARE M2D.T06TC005 TABLE
           ( COD_EMPRESA                    CHAR(4) NOT NULL,
             NOMBRE                         CHAR(40) NOT NULL,
             COD_NUM_DOC_OFICIA             CHAR(14) NOT NULL,
             TIMESTAMP_SIGLO                TIMESTAMP NOT NULL,
             COD_USU_MODIF                  CHAR(8) NOT NULL
           ) END-EXEC.
       01  T95BAN04.
           10 USR-SIGLO21          PIC X(8).
           10 USR-BANCS            PIC X(8).
           10 USR-NOMBRE           PIC X(60).
           10 BRANCH-NO            PIC X(4).
           10 TERM-NO              PIC 9(5).
           10 COD-EMPRESA          PIC X(4).
           10 EST-PROCESO          PIC X(2).
           10 OBSERVACION          PIC X(80).
           10 FEC-ULT-CAMBIO       PIC X(26).
           10 USR-ULT-CAMBIO       PIC X(8).
           EXEC SQL DECLARE T95BAN04 TABLE
           (
                 USR_SIGLO21    CHAR(8) DEFAULT ' ' NOT NULL,
                 USR_BANCS      CHAR(8) DEFAULT ' ' NOT NULL,
                 USR_NOMBRE     CHAR(60) DEFAULT ' ' NOT NULL,
                 BRANCH_NO      CHAR(4) DEFAULT ' ' NOT NULL,
                 TERM_NO        NUMBER(5) DEFAULT 0 NOT NULL,
                 COD_EMPRESA    CHAR(4) DEFAULT ' ' NOT NULL,
                 EST_PROCESO    CHAR(2) DEFAULT ' ' NOT NULL,
                 OBSERVACION    CHAR(80) DEFAULT ' ' NOT NULL,
                 FEC_ULT_CAMBIO TIMESTAMP(8) DEFAULT SYSTIMESTAMP NOT NULL,
                 USR_ULT_CAMBIO CHAR(8) DEFAULT ' ' NOT NULL
	   ) END-EXEC.
       01  T95CLB05.
           10 USR-SIGLO21             PIC X(80).
           10 USR-BANCS               PIC X(80).
           10 BANCS-PASS              PIC X(80).
           10 FEC-ULT-CAMBIO          PIC X(26).
   
           EXEC SQL DECLARE T95CLB05 TABLE
           (
                USR_SIGLO21    CHAR(80) DEFAULT ' ' NOT NULL,
                USR_BANCS      CHAR(80) DEFAULT ' ' NOT NULL,
                BANCS_PASS     CHAR(80) DEFAULT ' ' NOT NULL,
                FEC_ULT_CAMBIO TIMESTAMP(8) DEFAULT SYSTIMESTAMP NOT NULL
           ) END-EXEC.

       LINKAGE SECTION.
       01  DFHCOMMAREA      PIC X(291).
           COPY INPRG016.
           COPY INSSI006.

       PROCEDURE DIVISION.
           EXEC CICS ASKTIME ABSTIME(WS-TIEMPO)          END-EXEC.
           EXEC CICS FORMATTIME  ABSTIME(WS-TIEMPO)
                                  YYMMDD(FECHA-HOY)
                                    TIME(HORA-ABS)
                                 TIMESEP
                                    YEAR(WS-ANIO-HOY)    END-EXEC.
           MOVE WS-ANIO-HOY  TO FS-AA.
           MOVE FH-MMDD      TO FS-MMDD.
           MOVE DFHCOMMAREA  TO REG-INTP015.
           IF  P015-COMMAREA = '0' OR EIBCALEN = 0
               MOVE LOW-VALUES TO SSI0701O
               MOVE SPACES     TO REG-INTP015
               MOVE '1'        TO P015-COMMAREA
               MOVE -1         TO M15USRL
               PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01
               MOVE '1'        TO P015-COMMAREA
            ELSE
               IF P015-COMMAREA = '1' OR P015-COMMAREA = '9'
                  PERFORM RECIBE-MAPA-01 THRU RECIBE-MAPA-01
               ELSE
                  PERFORM RECIBE-SSITP002 THRU FRECIBE-SSITP002
               END-IF
               PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01
            END-IF.
       100-REGRESO.
	   EXEC CICS RETURN
		     TRANSID ('I007')
		     COMMAREA (REG-INTP015)
		     LENGTH (LENGTH OF REG-INTP015)
	   END-EXEC.


       RECIBE-MAPA-01.
		   EXEC CICS HANDLE AID ANYKEY(TERMINA-PRG)
					CLEAR (TERMINA-PRG)
					ENTER (VALIDA-ENTER)
					PF2   (VALIDA-INGRESO)
					PF4   (VALIDA-MODIFICA)
					PF5   (VALIDA-ELIMINA)
		   END-EXEC.
		   EXEC CICS RECEIVE MAP('SSI0701') MAPSET('SSIM007') END-EXEC.
       FRECIBE-MAPA-01.
           EXIT.


      *-------------------------------------------------------------*
      * Por alguna condicion de error el programa termina           *
      *-------------------------------------------------------------*
       ERROR-VALIDA-DATOS.
           MOVE RESPUESTA TO M15DET1O.
           PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01.
           GO TO 100-REGRESO.


      *-------------------------------------------------------------*
      * El usuario desea consultar un registro, valido datos input  *
      *-------------------------------------------------------------*
       VALIDA-ENTER.
           PERFORM VALIDA-DATOS THRU FVALIDA-DATOS.
           IF RESPUESTA NOT = SPACES
                MOVE RESPUESTA TO M15DET1O
                MOVE -1        TO M15USRL
                GO TO ERROR-VALIDA-DATOS.
           IF M15USRI NOT = SPACES
               MOVE SPACES      TO P015-SIGLO21
               MOVE M15USRI     TO P015-SIGLO21
		    USR-SIGLO21 OF T95BAN04
           ELSE
               MOVE -1                        TO M15USRL
               MOVE 'Ingrese usuario        ' TO M15DET1O
               GO TO ERROR-VALIDA-DATOS.

           MOVE 'C' TO P015-TIPO INSSI011-TIPO.
           PERFORM PROCESA-REQUERIMIENTO THRU FPROCESA-REQUERIMIENTO.
           IF P015-CODRES = 'OK '
                MOVE P015-CID          TO M15CIDO
                MOVE P015-NOMBRE       TO M15NOMBO
                MOVE P015-EMPRESA      TO M15CEMPO
                MOVE P015-CENTRO       TO M15CCENO
                MOVE P015-RESPUESTA    TO M15DET1O
                MOVE P015-SIGLO21      TO M15USRO
                MOVE P015-UPDFCH       TO M15UFCHO
                MOVE P015-UPDTIME      TO M15UHRSO
                MOVE P015-UPDUSR       TO M15UUSRO
                MOVE P015-UPDTERM      TO M15UTERO
                MOVE P015-DOMINIO      TO M15DOMIO
                MOVE P015-NODO         TO M15NODOO
                MOVE P015-CARGO        TO M15CARGO
                MOVE P015-FCHLOGON     TO M15FCHLO
                MOVE P015-TIMELOGON    TO M15HRSLO
                MOVE P015-AUTORIZA     TO M15SAUTO
                MOVE P015-OFCSWIFT     TO M15SWIFTO
                MOVE P015-PERS         TO M15SPVMO
                MOVE P015-LOGONSIGLO   TO M15LTERO
                MOVE P015-PERS         TO W-PERFIL
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE         TO M15DPVMO
                MOVE P015-CENTRO       TO W-CENTOFC
                MOVE P015-EMPRESA      TO W-EMPWORK
                PERFORM GETCENTRO THRU FGETCENTRO
                MOVE W-DETALLE         TO M15DCENO
                PERFORM GETEMPRESA  THRU FGETEMPRESA
                MOVE W-DETALLE         TO M15DEMPO
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE         TO M15DPVMO
                PERFORM GETOBSER THRU FGETOBSER
                PERFORM CONSULTA-USR THRU FCONSULTA-USR
      ******************************************************************
      *         IF EST-PROCESO OF T95BAN04 EQUAL 'TE'
      *            MOVE SPACES TO M15UBANO 
      *            MOVE LOW-VALUES  TO M15TBANO 
      *            MOVE SPACES TO INSSI011-UBANCS 
      *            MOVE ZEROS  TO INSSI011-STERMNO
      *            MOVE -1     TO M15UBANL
      *            MOVE -1     TO M15TBANL
      *         ELSE 
                   MOVE USR-BANCS OF T95BAN04 TO M15UBANO
                   MOVE TERMNO-BANCS          TO M15TBANO
      *         END-IF
            ELSE
                MOVE LOW-VALUES     TO SSI0701O
                MOVE P015-SIGLO21   TO M15USRO
                MOVE P015-RESPUESTA TO M15DET1O
           END-IF.
           MOVE -1 TO M15USRL.
           PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01.
           GO TO 100-REGRESO.


      *-------------------------------------------------------------*
      * Validacion basica, que se digite el usuario a consultar     *
      *-------------------------------------------------------------*
       VALIDA-DATOS.
	   INITIALIZE T95BAN04
	   MOVE SPACES TO TERMINAL-BANCS
           MOVE SPACES   TO RESPUESTA.
           IF P015-COMMAREA = '1'
              IF M15USRI IS EQUAL SPACES OR M15USRI = LOW-VALUES
                 MOVE 'Ingrese Usuario         ' TO RESPUESTA
                 MOVE -1 TO M15CIDL
                 GO TO FVALIDA-DATOS.
           IF P015-TIPO = 'I' OR P015-TIPO = 'M'
              PERFORM VALIDA-CAMPOS THRU FVALIDA-CAMPOS
              IF RESPUESTA NOT = SPACES
                 GO TO ERROR-VALIDA-DATOS
           END-IF.
       FVALIDA-DATOS.
           EXIT.

      *-------------------------------------------------------------*
      * Validacion para obligar ingresar datos bancs                *
      *-------------------------------------------------------------*
       VALIDA-DATOS-BANCS.
           MOVE SPACES   TO RESPUESTA.
           EXEC SQL
                SELECT COUNT(*)
                INTO   :W-NUMROWS
                FROM   M2D.T01GRE20
                WHERE  COD_GRUPO_USUARIO       = :W-PERFIL
                AND    SUBSTR(COD_RECURSO,1,2) = 'WT'
           END-EXEC
           IF SQLCODE EQUAL 100 
              MOVE '9' TO W-ESWT
           ELSE
              IF SQLCODE LESS ZEROS
                 MOVE '9' TO W-ESWT
                 MOVE -1 TO M15SPVML
                 MOVE 'Error en tabla T01GRE20' TO RESPUESTA
              END-IF
           END-IF
	   IF W-NUMROWS > 0
              MOVE '0' TO W-ESWT
           END-IF.
       FVALIDA-DATOS-BANCS.
           EXIT.
      
      *-------------------------------------------------------------*
      * Validacion de ingreso o modificacion de datos de usuario    *
      *-------------------------------------------------------------*
       VALIDA-CAMPOS.
           MOVE M15NOMBI  TO P015-NOMBRE INSSI011-NOMBRE.
           MOVE M15USRI   TO P015-SIGLO21 INSSI011-USIGLO21
                             USR-SIGLO21 OF T95BAN04.
           MOVE M15UBANI  TO INSSI011-UBANCS.
           MOVE M15TBANI  TO INSSI011-STERMNO TERMINAL-BANCS.
           MOVE M15SPVMI  TO P015-PERS.
           MOVE M15SOLICI TO W-SOLICI INSSI011-OBSERVACION.
           MOVE M15CCENI  TO P015-CENTRO INSSI011-BRANCHNO.
           MOVE 'N'       TO P015-STATUS.
           MOVE M15CIDI   TO P015-CID.
           MOVE M15CARGI  TO P015-CARGO.
           MOVE M15CEMPI  TO P015-EMPRESA INSSI011-EMPRESA.
           MOVE M15SWIFTI TO P015-OFCSWIFT
           PERFORM CONSULTA-BANCS THRU FCONSULTA-BANCS
           IF USR-HOM-BANCS NOT EQUAL SPACES
	      MOVE 9 TO M15UBANA
           END-IF
           IF M15SAUTI NOT EQUAL TO 1
              MOVE 0      TO P015-AUTORIZA
           ELSE
              MOVE 1      TO P015-AUTORIZA
           END-IF.
           IF P015-SIGLO21 = SPACES OR P015-SIGLO21 = LOW-VALUES
              MOVE -1                        TO M15USRL
              MOVE 'Ingrese Usuario        ' TO RESPUESTA
              GO TO FVALIDA-CAMPOS.
           IF P015-NOMBRE = SPACES OR P015-NOMBRE = LOW-VALUES
              MOVE -1                        TO M15NOMBL
              MOVE 'Ingrese Nombre de Usr. ' TO RESPUESTA
              GO TO FVALIDA-CAMPOS.
           IF M15SWIFTI NOT EQUAL SPACES AND 
              M15SWIFTI NOT EQUAL LOW-VALUES
              IF M15SWIFTI NOT EQUAL 'MSQUTODO'
                 MOVE -1                   TO M15SWIFTL
                 MOVE 'Of.Swift: MSQUTODO' TO RESPUESTA
                 GO TO FVALIDA-CAMPOS
              END-IF
           END-IF.
           IF M15SOLICI = SPACES OR M15SOLICI = LOW-VALUES
              MOVE 'Ingrese Observaciones ' TO RESPUESTA
              MOVE -1                       TO M15SOLICL
              GO TO FVALIDA-CAMPOS.
           IF P015-PERS NOT = SPACES AND P015-PERS NOT = LOW-VALUES
              MOVE P015-PERS               TO W-PERFIL
           ELSE
              MOVE -1                      TO M15SPVML
              MOVE 'Ingrese Perfil de VM ' TO RESPUESTA
              GO TO FVALIDA-CAMPOS.
      *    PERFORM VALIDA-DATOS-BANCS THRU FVALIDA-DATOS-BANCS
      *    IF W-ESWT = '0'
           IF M15UBANI NOT EQUAL SPACES AND 
              M15UBANI NOT EQUAL ZEROS  AND 
	      M15UBANI NOT EQUAL LOW-VALUES
              IF M15TBANI IS EQUAL SPACES     OR 
		 M15TBANI IS EQUAL LOW-VALUES OR
		 M15TBANI IS EQUAL ZEROS
                 MOVE -1                        TO M15TBANL
                 MOVE 'Ingrese Terminal BANCS.' TO RESPUESTA
                 IF USR-HOM-BANCS NOT EQUAL SPACES
	            MOVE 9 TO M15UBANA
                 END-IF
                 GO TO FVALIDA-CAMPOS
              END-IF
           ELSE
              IF M15TBANI NOT EQUAL SPACES AND 
		 M15TBANI NOT EQUAL ZEROS  AND
		 M15TBANI NOT EQUAL LOW-VALUES
                 IF M15UBANI IS EQUAL SPACES OR 
		    M15UBANI IS EQUAL ZEROS  OR
		    M15UBANI IS EQUAL LOW-VALUES
                    MOVE -1                        TO M15UBANL
                    MOVE 'Ingrese Usuario BANCS. ' TO RESPUESTA
                    GO TO FVALIDA-CAMPOS
                 END-IF 
              END-IF 
           END-IF
      *    END-IF.
           MOVE ZEROS    TO W-NUMROWS.
           EXEC SQL
                 SELECT COUNT(*)
                    INTO :W-NUMROWS
                    FROM M2D.T95PAR02
                    WHERE COD_GRUPO_USUARIO = :W-PERFIL
                    AND COD_PARAMETRO = 'GR'
           END-EXEC
           IF SQLCODE EQUAL 100 OR W-NUMROWS EQUAL ZEROS
                 MOVE -1 TO M15SPVML
                 MOVE 'Perfil NO definido en T95PAR02' TO RESPUESTA
              ELSE
                 IF SQLCODE LESS ZEROS
                    MOVE -1 TO M15SPVML
                    MOVE 'Error en tabla T95PAR02' TO RESPUESTA
                 END-IF
           END-IF.
           IF RESPUESTA NOT = SPACES
              GO TO FVALIDA-CAMPOS
           ELSE
              MOVE W-PERFIL TO P015-PERS
           END-IF.
           MOVE ZEROS     TO W-NUMROWS.
           EXEC SQL
                 SELECT COUNT(*)
                    INTO :W-NUMROWS
                    FROM M2D.T01GRE20
                    WHERE COD_GRUPO_USUARIO = :W-PERFIL
           END-EXEC
           IF SQLCODE EQUAL 100 OR W-NUMROWS EQUAL ZEROS
                 MOVE -1 TO M15SPVML
                 MOVE 'Perfil RE no definido en T01GRE20' TO RESPUESTA
              ELSE
                 IF SQLCODE LESS ZEROS
                    MOVE -1 TO M15SPVML
                    MOVE 'Error en tabla T01GRE20' TO RESPUESTA
                 END-IF
           END-IF.
           IF RESPUESTA NOT = SPACES
              GO TO FVALIDA-CAMPOS.

           MOVE ZEROS        TO W-NUMROWS.
           MOVE P015-EMPRESA TO W-CONEMPRESA.
           EXEC SQL
                 SELECT COUNT(*)
                    INTO :W-NUMROWS
                    FROM M2D.T06TC005
                    WHERE COD_EMPRESA = :W-CONEMPRESA
           END-EXEC
           IF SQLCODE EQUAL 100 OR W-NUMROWS EQUAL ZEROS
                 MOVE -1 TO M15CEMPL
                 MOVE 'Empresa no definida T06TC005' TO RESPUESTA
              ELSE
                 IF SQLCODE LESS ZEROS
                    MOVE -1 TO M15CEMPL
                    MOVE 'Error en tabla T06TC005' TO RESPUESTA
                 END-IF
           END-IF.
           IF RESPUESTA NOT = SPACES
              MOVE ZEROS    TO P015-EMPRESA
              GO TO FVALIDA-CAMPOS.

           IF P015-CENTRO > 0
              MOVE P015-CENTRO TO W-CENTOFC
           ELSE
              MOVE 'Ingrese Codigo de Centro ' TO RESPUESTA
              MOVE ZEROS       TO P015-CENTRO
              GO TO FVALIDA-CAMPOS.
           MOVE ZEROS        TO W-NUMROWS.
           EXEC SQL
                 SELECT COUNT(*)
                    INTO :W-NUMROWS
                    FROM M2D.T06TC007
                    WHERE COD_EMPRESA = :W-CONEMPRESA
                    AND   COD_CENTRO  = :W-CENTOFC
           END-EXEC
           IF SQLCODE EQUAL 100 OR W-NUMROWS EQUAL ZEROS
                 MOVE -1 TO M15CCENL
                 MOVE 'Centro no definido T06TC007' TO RESPUESTA
              ELSE
                 IF SQLCODE LESS ZEROS
                    MOVE -1 TO M15CCENL
                    MOVE 'Error en tabla T06TC007' TO RESPUESTA
                 END-IF
           END-IF.
           IF RESPUESTA NOT = SPACES
              GO TO FVALIDA-CAMPOS.
           MOVE 'N'      TO  P015-STATUS.
           IF P015-CID = ZEROS OR P015-CID = LOW-VALUES
              MOVE ZEROS  TO P015-CID
           END-IF.
           IF P015-CARGO = SPACES OR P015-CARGO = LOW-VALUES
              MOVE SPACES  TO P015-CARGO
           END-IF.
           IF P015-TIPO = 'I'
      *        MOVE '0001'   TO P015-DOMINIO
              MOVE ZEROS    TO P015-FCHLOGON
              MOVE ZEROS    TO P015-TIMELOGON
              MOVE SPACES   TO P015-FCHNOSIGLO
                               P015-TIMENOSIGLO
                               P015-TERMNOSIGLO
                               P015-LOGONSIGLO
           END-IF.
       FVALIDA-CAMPOS.
           EXIT.


      *-------------------------------------------------------------*
      * Se valida el ingreso de un nuevo usuario                    *
      *-------------------------------------------------------------*
       VALIDA-INGRESO.
           MOVE 'I' TO P015-TIPO INSSI011-TIPO.
           PERFORM VALIDA-DATOS THRU FVALIDA-DATOS.
           IF RESPUESTA NOT = SPACES
                MOVE RESPUESTA TO M15DET1O
                MOVE -1        TO M15USRL
                GO TO ERROR-VALIDA-DATOS.

           PERFORM PROCESA-REQUERIMIENTO THRU FPROCESA-REQUERIMIENTO.
           IF P015-CODRES = 'OK '
                MOVE P015-CID         TO M15CIDO
                MOVE P015-NOMBRE      TO M15NOMBO
                MOVE P015-EMPRESA     TO M15CEMPO
                MOVE P015-CENTRO      TO M15CCENO
                MOVE P015-RESPUESTA   TO M15DET1O
                MOVE P015-SIGLO21     TO M15USRO
                MOVE P015-UPDFCH      TO M15UFCHO
                MOVE P015-UPDTIME     TO M15UHRSO
                MOVE P015-UPDUSR      TO M15UUSRO
                MOVE P015-UPDTERM     TO M15UTERO
                MOVE P015-DOMINIO     TO M15DOMIO
                MOVE P015-NODO        TO M15NODOO
                MOVE P015-CARGO       TO M15CARGO
                MOVE P015-FCHLOGON    TO M15FCHLO
                MOVE P015-TIMELOGON   TO M15HRSLO
                MOVE P015-AUTORIZA    TO M15SAUTO
                MOVE P015-OFCSWIFT    TO M15SWIFTO
                MOVE P015-PERS        TO M15SPVMO
                MOVE P015-LOGONSIGLO  TO M15LTERO
                MOVE P015-PERS        TO W-PERFIL
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE        TO M15DPVMO
                MOVE P015-CENTRO      TO W-CENTOFC
                MOVE P015-EMPRESA     TO W-EMPWORK
                PERFORM GETCENTRO THRU FGETCENTRO
                MOVE W-DETALLE        TO M15DCENO
                PERFORM GETEMPRESA  THRU FGETEMPRESA
                MOVE W-DETALLE        TO M15DEMPO
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE        TO M15DPVMO
		IF M15UBANI NOT EQUAL SPACES AND 
	           M15UBANI <> LOW-VALUES
		   IF M15TBANI NOT EQUAL SPACES AND 
		      M15TBANI <> LOW-VALUES
                       MOVE 'TC'    TO INSSI011-ESTPROCESO
		                    EST-PROCESO OF T95BAN04
                      PERFORM INGRESA-USR THRU FINGRESA-USR
                   END-IF
                END-IF
                PERFORM MODIFICA-OBSER THRU FMODIFICA-OBSER
            ELSE
                MOVE P015-RESPUESTA   TO M15DET1O
           END-IF.
           MOVE -1             TO M15USRL.
           PERFORM WRITELOG  THRU FWRITELOG.
           PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01.
           GO TO 100-REGRESO.




      *-------------------------------------------------------------*
      * Modificacion de un usuario ya existente                     *
      *-------------------------------------------------------------*
       VALIDA-MODIFICA.
           MOVE 'M'            TO P015-TIPO INSSI011-TIPO.
           MOVE P015-PERS      TO LOG-PERS.
           MOVE P015-CENTRO    TO LOG-CENTRO.
           MOVE P015-AUTORIZA  TO LOG-AUTORIZA.
           PERFORM VALIDA-DATOS THRU FVALIDA-DATOS.
           IF RESPUESTA NOT = SPACES
                MOVE RESPUESTA TO M15DET1O
                MOVE -1        TO M15USRL
                GO TO ERROR-VALIDA-DATOS.
           MOVE 'M' TO P015-TIPO INSSI011-TIPO.

           PERFORM PROCESA-REQUERIMIENTO THRU FPROCESA-REQUERIMIENTO.
           IF P015-CODRES = 'OK '
                MOVE P015-CID       TO M15CIDO
                MOVE P015-NOMBRE    TO M15NOMBO
                MOVE P015-EMPRESA   TO M15CEMPO
                MOVE P015-CENTRO    TO M15CCENO
                MOVE P015-RESPUESTA TO M15DET1O
                MOVE P015-SIGLO21   TO M15USRO
                MOVE P015-UPDFCH    TO M15UFCHO
                MOVE P015-UPDTIME   TO M15UHRSO
                MOVE P015-UPDUSR    TO M15UUSRO
                MOVE P015-UPDTERM   TO M15UTERO
                MOVE P015-DOMINIO   TO M15DOMIO
                MOVE P015-NODO      TO M15NODOO
                MOVE P015-CARGO     TO M15CARGO
                MOVE P015-FCHLOGON  TO M15FCHLO
                MOVE P015-TIMELOGON TO M15HRSLO
                MOVE P015-AUTORIZA  TO M15SAUTO
                MOVE P015-OFCSWIFT  TO M15SWIFTO
                MOVE P015-PERS      TO M15SPVMO
                MOVE P015-LOGONSIGLO TO M15LTERO
                MOVE P015-PERS      TO W-PERFIL
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE      TO M15DPVMO
                MOVE P015-CENTRO    TO W-CENTOFC
                MOVE P015-EMPRESA   TO W-EMPWORK
                PERFORM GETCENTRO THRU FGETCENTRO
                MOVE W-DETALLE      TO M15DCENO
                PERFORM GETEMPRESA  THRU FGETEMPRESA
                MOVE W-DETALLE         TO M15DEMPO
                PERFORM GETRECU THRU FGETRECU
                MOVE W-DETALLE      TO M15DPVMO
                MOVE P015-SIGLO21 TO USR-SIGLO21 OF T95BAN04 
                PERFORM CONSULTA-BANCS THRU FCONSULTA-BANCS
                IF USR-HOM-BANCS NOT EQUAL SPACES
                   MOVE EST-HOM-PROC TO INSSI011-ESTPROCESO
                                       EST-PROCESO OF T95BAN04
		   IF EST-HOM-PROC = 'TE'
                      MOVE 'TC'        TO INSSI011-ESTPROCESO
		                       EST-PROCESO OF T95BAN04
                   END-IF
                ELSE
                   MOVE 'TC'        TO INSSI011-ESTPROCESO
		                    EST-PROCESO OF T95BAN04
                END-IF
		   
		IF M15UBANI    EQUAL SPACES 
		   OR M15TBANI EQUAL SPACES  
		   OR M15TBANI EQUAL LOW-VALUES  
		   IF USR-HOM-BANCS NOT EQUAL SPACES
                      MOVE USR-HOM-BANCS TO INSSI011-UBANCS
                      MOVE TERMNO-BANCS  TO INSSI011-STERMNO
		      MOVE SPACES     TO M15UBANO
		      MOVE LOW-VALUES TO M15TBANO
                   END-IF
                ELSE
nel                IF USR-HOM-BANCS     NOT EQUAL SPACES
	     	      AND M15UBANI      NOT EQUAL SPACES 
                      AND USR-HOM-BANCS NOT EQUAL M15UBANI 
                      MOVE M15UBANI     TO INSSI011-UBANCS
                      MOVE M15TBANI     TO TERMNO-BANCS 
				           INSSI011-STERMNO
		   END-IF
                END-IF
                PERFORM MODIFICA-USR THRU FMODIFICA-USR
                PERFORM MODIFICA-OBSER THRU FMODIFICA-OBSER
           ELSE
                MOVE P015-RESPUESTA TO M15DET1O
           END-IF.
           PERFORM WRITELOG  THRU FWRITELOG.
           MOVE -1             TO M15USRL.
           PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01.
           GO TO 100-REGRESO.


      *-------------------------------------------------------------*
      * Se eliminara un usuario de la base de datos                 *
      *-------------------------------------------------------------*
       VALIDA-ELIMINA.
           PERFORM VALIDA-DATOS THRU FVALIDA-DATOS.
           IF RESPUESTA NOT = SPACES
                MOVE RESPUESTA TO M15DET1O
                MOVE -1        TO M15USRL
                GO TO ERROR-VALIDA-DATOS.
           IF M15SOLICI = SPACES OR M15SOLICI = LOW-VALUES
              MOVE 'Ingrese Observaciones ' TO RESPUESTA
              MOVE -1 TO M15SOLICL
              GO TO ERROR-VALIDA-DATOS.
           MOVE 'E' TO P015-TIPO INSSI011-TIPO.
           PERFORM PROCESA-REQUERIMIENTO THRU FPROCESA-REQUERIMIENTO.
           IF M15UBANI NOT EQUAL SPACES AND
              M15UBANI NOT EQUAL LOW-VALUES
              MOVE 'TE'       TO EST-PROCESO OF T95BAN04
              MOVE M15USRI    TO USR-SIGLO21 OF T95BAN04
              MOVE M15SOLICI  TO OBSERVACION OF T95BAN04
              PERFORM MODIFICA-ESTADO-BANCS  THRU 
                      FMODIFICA-ESTADO-BANCS
              MOVE LOW-VALUES TO M15TBANO M15UBANO
           END-IF
           PERFORM ELIMINA-OBSERVACION  THRU FELIMINA-OBSERVACION
           PERFORM WRITELOG  THRU FWRITELOG.
           MOVE P015-RESPUESTA TO M15DET1O.
           MOVE -1             TO M15USRL.
           PERFORM ENVIA-MAPA-01  THRU FENVIA-MAPA-01.
           GO TO 100-REGRESO.


      *-------------------------------------------------------------*
      * Se procesan las consultas,modificaciones,ingreso y eliminaci*
      * ones sobre la base de usuarios.                             *
      *-------------------------------------------------------------*
       PROCESA-REQUERIMIENTO.
           EXEC CICS ASSIGN USERID(W-USERID) APPLID(W-APPLID) END-EXEC.
           EXEC CICS GETMAIN SET(ADDRESS OF REG-INTP016)
                          LENGTH(LENGTH OF REG-INTP016)
           END-EXEC.
           MOVE SPACES        TO REG-INTP016.
           MOVE P015-TIPO     TO P016-TIPO INSSI011-TIPO.
           MOVE P015-REGISTRO TO P016-REGISTRO.
           MOVE FECHA-SISTEMA TO P016-UPFCH.
           MOVE ES-HORA       TO UDP-HOR.
           MOVE ES-MINU       TO UDP-MIN.
           MOVE ES-SEGU       TO UDP-SEG.
           MOVE WS-HORA       TO P016-UPTIME.
           MOVE W-USERID      TO P016-UPUSR INSSI011-UCAMBIO.
           MOVE EIBTRMID      TO P016-UPTERM.
           MOVE '3270'        TO P016-TOKEN.
           SET PUNTERO TO ADDRESS OF REG-INTP016.
           EXEC CICS LINK PROGRAM('PRG016')
                         COMMAREA(PUNTERO)
                           LENGTH(LENGTH OF PUNTERO)
           END-EXEC.

           MOVE P016-TIPO      TO P015-TIPO INSSI011-TIPO.
           MOVE P016-REGISTRO  TO P015-REGISTRO.
           MOVE P016-CODRES    TO P015-CODRES.
           MOVE P016-RESPUESTA TO P015-RESPUESTA.

           IF P016-FCHLOGON IS NUMERIC
              MOVE P016-FCHLOGON   TO P015-FCHLOGON
           ELSE
              MOVE ZEROS           TO P015-FCHLOGON.
           IF P016-TIMELOGON IS NUMERIC
              MOVE P016-TIMELOGON  TO P015-TIMELOGON
           ELSE
              MOVE ZEROS         TO P015-TIMELOGON.
           EXEC CICS FREEMAIN DATA(REG-INTP016) END-EXEC.
       FPROCESA-REQUERIMIENTO.
           EXIT.


      *-------------------------------------------------------------*
      * El programa termina y regresa al punto donde fue llamado    *
      *-------------------------------------------------------------*
       TERMINA-PRG.
           EXEC CICS XCTL PROGRAM('PRG000') END-EXEC.




      *-------------------------------------------------------------*
      * El programa termina y regresa al punto donde fue llamado    *
      *-------------------------------------------------------------*
       ENVIA-MAPA-01.
		   MOVE '     ENTER-CONSULTA     F2-INGRESA    ' TO M15TEC1O.
		   MOVE '        F4-MODIFICA     F5-ELIMINA    ' TO M15TEC2O.
		   MOVE FECHA-SISTEMA          TO M15FECHAO.
		   MOVE HORA-ABS               TO M15HORAO.
		   MOVE EIBTRMID               TO M15TERMO.
		   EXEC CICS ASSIGN USERID(W-USERID) APPLID(W-APPLID) END-EXEC.
		   MOVE W-USERID               TO M15USERO.
		   MOVE W-APPLID               TO M15CICSO.
		   EXEC CICS SEND
			     MAP('SSI0701')
			     MAPSET('SSIM007')
			     ERASE
			     CURSOR()
           END-EXEC.
       FENVIA-MAPA-01.
           EXIT.




      *-------------------------------------------------------------*
      * Se graba el Log del sistema administrativo                  *
      *-------------------------------------------------------------*
       WRITELOG.
           MOVE SPACES TO R-T95LOG01.
           MOVE ZEROS TO INPRG008-RET.
           IF P015-TIPO = 'I' OR P015-TIPO = 'M' OR P015-TIPO = 'E'
              MOVE 'T95USU03' TO T95LOG01-TRANSACCION.
           IF P015-TIPO = 'I'
              MOVE 'INGRESO' TO T95LOG01-OPERACION.
           IF P015-TIPO = 'M'
              MOVE 'MODIFICACION' TO T95LOG01-OPERACION.
           IF P015-TIPO = 'E'
              MOVE 'ELIMINACION' TO T95LOG01-OPERACION.
           MOVE P015-SIGLO21    TO T95LOG01-MENSAJERIA (1:8).
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (9:1).
           MOVE P015-NOMBRE     TO T95LOG01-MENSAJERIA (10:20).
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (30:1).
           MOVE P015-PERS       TO T95LOG01-MENSAJERIA (31:08).
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (41:1).
           MOVE P015-CENTRO     TO T95LOG01-MENSAJERIA (42:4).
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (46:1).
           MOVE P015-AUTORIZA   TO T95LOG01-MENSAJERIA (47:1).
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (48:1).
           IF P015-TIPO = 'M'
              MOVE 'MODIFICACI' TO T95LOG01-OPERACION
              MOVE LOG-PERS     TO T95LOG01-MENSAJERIA (49:8)
              MOVE W-DEL        TO T95LOG01-MENSAJERIA (57:1)
              MOVE LOG-CENTRO   TO T95LOG01-MENSAJERIA (58:4)
              MOVE W-DEL        TO T95LOG01-MENSAJERIA (62:1)
              MOVE LOG-AUTORIZA TO T95LOG01-MENSAJERIA (63:1)
           ELSE
              MOVE '********'   TO T95LOG01-MENSAJERIA (49:8)
              MOVE W-DEL        TO T95LOG01-MENSAJERIA (57:1)
              MOVE '****'       TO T95LOG01-MENSAJERIA (58:4)
              MOVE W-DEL        TO T95LOG01-MENSAJERIA (62:1)
              MOVE '*'          TO T95LOG01-MENSAJERIA (63:1)
           END-IF.
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (64:1)
           MOVE M15SOLICI       TO T95LOG01-MENSAJERIA (65:15)
                                   T95LOG01-CMP-OBSERVACION.
           MOVE W-DEL           TO T95LOG01-MENSAJERIA (80:1)
           MOVE P015-RESPUESTA  TO T95LOG01-MENSAJERIA (81:19).
           MOVE R-T95LOG01      TO INPRG008-T95LOG01.
           MOVE LENGTH OF R-INPRG008 TO W-LEN.
           EXEC CICS LINK PROGRAM('PRG008') COMMAREA(R-INPRG008)
                     LENGTH(W-LEN) NOHANDLE
           END-EXEC.
           IF EIBRESP EQUAL DFHRESP(NORMAL)
              IF INPRG008-RET EQUAL ZEROS
                 MOVE SPACES  TO RESPUESTA
              ELSE
                 MOVE 'Error XXX PRG008 (Write Log)' TO RESPUESTA
              END-IF
           ELSE
              MOVE 'Err XXX Link PRG008 Write Log' TO RESPUESTA
           END-IF.
       FWRITELOG.
           EXIT.

       GETOBSER.
           MOVE P015-SIGLO21 TO COD-USUARIO OF T95OBS04
           EXEC SQL
                SELECT CMP_OBSERVACION
                INTO   :T95OBS04.CMP-OBSERVACION
                FROM   M2D.T95OBS04
                WHERE  COD_USUARIO = :T95OBS04.COD-USUARIO
           END-EXEC.
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              MOVE SPACES TO M15SOLICO
           ELSE
              MOVE CMP-OBSERVACION OF T95OBS04
                TO M15SOLICO
           END-IF.
       FGETOBSER.
           EXIT.

       INSERTA-OBSER.
           MOVE P015-SIGLO21 TO COD-USUARIO       OF T95OBS04
           MOVE W-USERID     TO COD-USUARIO-MOD   OF T95OBS04
           MOVE W-SOLICI     TO CMP-OBSERVACION   OF T95OBS04
           EXEC SQL
                INSERT INTO T95OBS04
                       (COD_USUARIO,
                        COD_USUARIO_MOD,
                        FEC_ULT_OBS,
                        CMP_OBSERVACION)
                VALUES (:T95OBS04.COD-USUARIO,
                        :T95OBS04.COD-USUARIO-MOD,
                        CURRENT_TIMESTAMP,
                        :T95OBS04.CMP-OBSERVACION)
           END-EXEC.

           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              IF SQLCODE LESS ZEROS
                 MOVE 'Error en tabla T95OBS04 ' TO W-DETALLE
              ELSE
                 MOVE 'Ingreso Fallido T95OBS04' TO P015-RESPUESTA
              END-IF
           ELSE
              MOVE CMP-OBSERVACION OF T95OBS04
                TO M15SOLICO
           END-IF.

       FINSERTA-OBSER.
           EXIT.

       MODIFICA-OBSER.
           MOVE P015-SIGLO21 TO COD-USUARIO     OF T95OBS04
           MOVE W-USERID     TO COD-USUARIO-MOD OF T95OBS04
           MOVE W-SOLICI     TO CMP-OBSERVACION OF T95OBS04
           EXEC SQL
                UPDATE T95OBS04
                SET    COD_USUARIO_MOD = :T95OBS04.COD-USUARIO-MOD,
                       FEC_ULT_OBS     =  CURRENT_TIMESTAMP,
                       CMP_OBSERVACION = :T95OBS04.CMP-OBSERVACION
                WHERE  COD_USUARIO     = :T95OBS04.COD-USUARIO
           END-EXEC.

           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              PERFORM INSERTA-OBSER THRU FINSERTA-OBSER
              IF SQLCODE LESS ZEROS
                 MOVE 'Error en UPD T95OBS04 ' TO W-DETALLE
              ELSE
                 MOVE 'UPDATE Fallido T95OBS04' TO P015-RESPUESTA
              END-IF
           ELSE
              MOVE CMP-OBSERVACION OF T95OBS04
                TO M15SOLICO
           END-IF.

       FMODIFICA-OBSER.
           EXIT.

       GETRECU.
           EXEC SQL
              SELECT DESCRIPCION
                 INTO :T95PAR02-DESCRIPCION
                 FROM M2D.T95PAR02
                 WHERE COD_GRUPO_USUARIO = :W-PERFIL
                   AND COD_PARAMETRO = 'GR'
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              MOVE T95PAR02-DESCRIPCION TO W-DETALLE
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE 'No existe en tabla Parametros' TO W-DETALLE
              ELSE
                 MOVE 'Error grave tabla Parametros' TO W-DETALLE
              END-IF
           END-IF.
       FGETRECU.
           EXIT.
       GETCENTRO.
           EXEC SQL
              SELECT NOMBRE
                 INTO :T06-NOMBRE
                 FROM M2D.T06TC007
                 WHERE COD_EMPRESA = :W-EMPWORK
                 AND   COD_CENTRO  = :W-CENTOFC
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              MOVE T06-NOMBRE  TO W-DETALLE
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE 'No existe en tabla T06TC007  ' TO W-DETALLE
              ELSE
                 MOVE -1 TO M15USRL
                 MOVE 'Error grave tabla T06TC007  ' TO W-DETALLE
              END-IF
           END-IF.
       FGETCENTRO.
           EXIT.
       GETEMPRESA.
           EXEC SQL
              SELECT NOMBRE
                 INTO :T0605-NOMBRE
                 FROM M2D.T06TC005
                 WHERE COD_EMPRESA = :W-EMPWORK
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              MOVE T0605-NOMBRE  TO W-DETALLE
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE 'No existe en tabla T06TC005  ' TO W-DETALLE
              ELSE
                 MOVE 'Error grave tabla T06TC005  ' TO W-DETALLE
              END-IF
           END-IF.
       FGETEMPRESA.
           EXIT.
       9400-ECIPHER.
           MOVE SPACES     TO R-DATOS-INPUT.
           MOVE W-PASSWORD TO INPUT-DAT01.
           MOVE '3'        TO INPUT-FUNCION.
           EXEC CICS LINK PROGRAM('SSITP003')
                         COMMAREA(R-DATOS-INPUT)
                           LENGTH(LENGTH OF R-DATOS-INPUT)
           END-EXEC.
           MOVE INPUT-SALIDA TO W-DATKEY16.
       9400-FECIPHER.
           EXIT.
       2700-DATOS-VSAM.
           EXEC CICS GETMAIN SET(ADDRESS OF REG-INTP016)
                          LENGTH(LENGTH OF REG-INTP016)
           END-EXEC.
           MOVE SPACES        TO REG-INTP016.
           MOVE W-TIPO        TO P016-TIPO INSSI011-TIPO.
           MOVE P015-REGISTRO TO P016-REGISTRO.
           SET PUNTERO TO ADDRESS OF REG-INTP016.
           EXEC CICS LINK PROGRAM('PRG016')
                         COMMAREA(PUNTERO)
                           LENGTH(LENGTH OF PUNTERO)
           END-EXEC.

           MOVE P016-TIPO      TO P015-TIPO INSSI011-TIPO.
           MOVE P016-REGISTRO  TO P015-REGISTRO.
           MOVE P016-CODRES    TO P015-CODRES.
           MOVE P016-RESPUESTA TO P015-RESPUESTA.
           EXEC CICS FREEMAIN DATA(REG-INTP016) END-EXEC.
       2800-FDATOS-VSAM.
           EXIT.
       9900-VALKEYS.
           EXEC CICS GETMAIN SET(ADDRESS OF R-INSSI006)
                          LENGTH(LENGTH OF R-INSSI006)
           END-EXEC.
           MOVE SPACES        TO R-INSSI006.
           MOVE W-TIPO        TO INSSI006-TIPO INSSI011-TIPO.
           MOVE W-REGI-006    TO INSSI006-REGISTRO.
           SET PUNTERO TO ADDRESS OF R-INSSI006.
           EXEC CICS LINK PROGRAM('SSITP006')
                         COMMAREA(PUNTERO)
                           LENGTH(LENGTH OF PUNTERO)
           END-EXEC.
           MOVE INSSI006-TIPO      TO W-TIPO INSSI011-TIPO.
           MOVE INSSI006-REGISTRO  TO W-REGI-006.
           MOVE INSSI006-CODRES    TO W-CODRES.
           MOVE INSSI006-RESPUESTA TO W-RESPUESTA.
           EXEC CICS FREEMAIN DATA(R-INSSI006) END-EXEC.
       9900-FVALKEYS.
           EXIT.

       PROCESA-BANCS.
           MOVE LENGTH OF R-INSSI011 TO W-LEN.
           EXEC CICS LINK PROGRAM('SSITP011') COMMAREA(R-INSSI011)
                     LENGTH(W-LEN) NOHANDLE
           END-EXEC.
           IF EIBRESP EQUAL DFHRESP(NORMAL)
              IF INSSI011-CODRES EQUAL ZEROS
                 MOVE SPACES  TO RESPUESTA
              ELSE
                 MOVE 'Error SSITP011 ' TO RESPUESTA
              END-IF
           ELSE
              MOVE 'Err Link SSITP011 ' TO RESPUESTA
           END-IF.
       FPROCESA-BANCS.
           EXIT.

       RECIBE-SSITP002.
           MOVE LOW-VALUES                TO SSI0701O
           MOVE 'C'                       TO P015-TIPO INSSI011-TIPO.
           PERFORM PROCESA-REQUERIMIENTO THRU FPROCESA-REQUERIMIENTO.
           MOVE P015-CID                  TO M15CIDO.
           MOVE P015-NOMBRE               TO M15NOMBO.
           MOVE P015-EMPRESA              TO M15CEMPO.
           MOVE P015-CENTRO               TO M15CCENO.
           MOVE P015-RESPUESTA            TO M15DET1O.
           MOVE P015-SIGLO21              TO M15USRO.
           MOVE P015-UPDFCH               TO M15UFCHO.
           MOVE P015-UPDTIME              TO M15UHRSO.
           MOVE P015-UPDUSR               TO M15UUSRO.
           MOVE P015-UPDTERM              TO M15UTERO.
           MOVE P015-DOMINIO              TO M15DOMIO.
           MOVE P015-NODO                 TO M15NODOO.
           MOVE P015-CARGO                TO M15CARGO.
           MOVE P015-FCHLOGON             TO M15FCHLO.
           MOVE P015-TIMELOGON            TO M15HRSLO.
           MOVE P015-AUTORIZA             TO M15SAUTO.
           MOVE P015-OFCSWIFT             TO M15SWIFTO.
           MOVE P015-PERS                 TO M15SPVMO.
           MOVE P015-LOGONSIGLO           TO M15LTERO.
           MOVE P015-PERS                 TO W-PERFIL.
           PERFORM GETRECU THRU FGETRECU.
           MOVE W-DETALLE                 TO M15DPVMO.
           MOVE P015-CENTRO               TO W-CENTOFC.
           MOVE P015-EMPRESA              TO W-EMPWORK.
           PERFORM GETCENTRO THRU FGETCENTRO.
           MOVE W-DETALLE                 TO M15DCENO.
           PERFORM GETEMPRESA  THRU FGETEMPRESA.
           MOVE W-DETALLE                 TO M15DEMPO.
           PERFORM GETRECU  THRU FGETRECU.
           PERFORM GETOBSER THRU FGETOBSER
           MOVE W-DETALLE                 TO M15DPVMO.
           MOVE P015-SIGLO21 TO USR-SIGLO21 OF T95BAN04
           PERFORM CONSULTA-USR THRU FCONSULTA-USR
           MOVE USR-BANCS OF T95BAN04 TO M15UBANO
           MOVE TERMNO-BANCS          TO M15TBANO
           MOVE -1                    TO M15USRL.
           MOVE '9'                   TO P015-COMMAREA.
       FRECIBE-SSITP002.
           EXIT.

       CONSULTA-BANCS.
           EXEC SQL
                SELECT USR_BANCS,
                       TERM_NO,
		       EST_PROCESO
                INTO   :USR-HOM-BANCS,
                       :TERMNO-BANCS,
                       :EST-HOM-PROC
                FROM   T95BAN04
                WHERE  USR_SIGLO21 = :T95BAN04.USR-SIGLO21 
           END-EXEC.
	   DISPLAY 'SSITP007 CONS-BANCS= ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              MOVE SPACES TO TERMINAL-BANCS
                             USR-HOM-BANCS	
                             EST-HOM-PROC
	      MOVE SQLCODE TO NUM-RESP
              IF SQLCODE LESS ZEROS
                 MOVE 'NO '                    TO INSSI011-CODRES
                 MOVE 'Err T95BAN04 SqlCode=-' TO TXT-RESP
                 MOVE WS-RESPUESTA             TO RESPUESTA
                 MOVE W-RESPUESTA              TO INSSI011-RESPUESTA
              ELSE
                 MOVE 'NO '  TO INSSI011-CODRES
                 MOVE 'User no existe en BAN04' TO INSSI011-RESPUESTA
              END-IF
           ELSE            
              MOVE 9        TO M15UBANA
      *       MOVE 9        TO M15TBANA
           END-IF.
       FCONSULTA-BANCS.
           EXIT.

       CONSULTA-USR.
           EXEC SQL
                SELECT USR_SIGLO21,
                       USR_BANCS,
                       USR_NOMBRE,
                       BRANCH_NO, 
                       TERM_NO,
                       COD_EMPRESA,
                       EST_PROCESO,
                       OBSERVACION
                INTO   :T95BAN04.USR-SIGLO21,
                       :T95BAN04.USR-BANCS,
                       :T95BAN04.USR-NOMBRE,
                       :T95BAN04.BRANCH-NO,
                       :TERMNO-BANCS,
                       :T95BAN04.COD-EMPRESA,
                       :T95BAN04.EST-PROCESO,
                       :T95BAN04.OBSERVACION
                FROM   T95BAN04
                WHERE  USR_SIGLO21 = :T95BAN04.USR-SIGLO21 
           END-EXEC.
	   DISPLAY 'SSITP007 MOD= ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
	      MOVE SQLCODE TO NUM-RESP
              IF SQLCODE LESS ZEROS
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Err T95BAN04 SqlCode=-' TO TXT-RESP
                 MOVE WS-RESPUESTA             TO RESPUESTA
                 MOVE W-RESPUESTA              TO INSSI011-RESPUESTA
              ELSE
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'User no existe en BAN04' TO INSSI011-RESPUESTA
              END-IF
           ELSE
                 MOVE 'OK '   TO INSSI011-CODRES
                 MOVE 'Consulta SIGLO21 Ok    ' TO INSSI011-RESPUESTA
                 PERFORM MOVER-DATOS-LEIDOS-BANCS 
                    THRU FMOVER-DATOS-LEIDOS-BANCS
                 MOVE 9        TO M15UBANA
      *          MOVE 9        TO M15TBANA
           END-IF.
       FCONSULTA-USR.
           EXIT.

       INGRESA-USR.
           PERFORM MOVER-DATOS-USR-BANCS THRU FMOVER-DATOS-USR-BANCS.
	   IF USR-SIGLO21 OF T95BAN04 EQUAL SPACES OR
	      USR-SIGLO21 OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FINGRESA-USR
           END-IF
           IF USR-BANCS   OF T95BAN04 EQUAL SPACES OR
	      USR-BANCS   OF T95BAN04 EQUAL ZEROS  OR 
	      USR-BANCS   OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FINGRESA-USR
           END-IF
           IF TERM-NO OF T95BAN04 EQUAL SPACES OR
	      TERM-NO OF T95BAN04 EQUAL ZEROS  OR 
	      TERM-NO OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FINGRESA-USR
           END-IF
      *    DISPLAY 'SSITP011: USRS21  ' USR-SIGLO21 OF T95BAN04

           EXEC SQL
                INSERT INTO T95BAN04
                     ( USR_SIGLO21,
                       USR_BANCS,
                       USR_NOMBRE,
                       BRANCH_NO,
                       TERM_NO,
                       COD_EMPRESA,
                       EST_PROCESO,
                       OBSERVACION,
                       FEC_ULT_CAMBIO,
                       USR_ULT_CAMBIO
                     )
                VALUES(:T95BAN04.USR-SIGLO21,
                       :T95BAN04.USR-BANCS,
                       :T95BAN04.USR-NOMBRE,
                       :T95BAN04.BRANCH-NO,
                       :T95BAN04.TERM-NO,
                       :T95BAN04.COD-EMPRESA,
                       :T95BAN04.EST-PROCESO,
                       :T95BAN04.OBSERVACION,
                       SYSTIMESTAMP,
                       :T95BAN04.USR-ULT-CAMBIO
                      )
           END-EXEC.
           DISPLAY 'SSITP011-ING: SQLCODE ' SQLCODE

           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
	         MOVE SQLCODE TO NUM-RESP
                 IF SQLCODE LESS ZEROS
                    IF SQLCODE EQUAL -1
                     MOVE -1  TO M15UBANL
		     MOVE 'Usuario Bancs Duplicado' TO RESPUESTA
                    ELSE
                      MOVE 'NO '   TO INSSI011-CODRES
                      MOVE 'Err T95BAN04 SqlCode=-' TO TXT-RESP
                      MOVE WS-RESPUESTA TO RESPUESTA
                    END-IF
                  ELSE
                     MOVE 'NO '   TO INSSI011-CODRES
                     MOVE 'Ingreso fallido BAN04' TO TXT-RESP
                     MOVE WS-RESPUESTA TO RESPUESTA
                  END-IF
                  GO TO ERROR-VALIDA-DATOS
           ELSE
                 MOVE 9        TO M15UBANA
      *          MOVE 9        TO M15TBANA
                 MOVE 'OK '            TO INSSI011-CODRES
                 MOVE 'Ingreso OK    ' TO INSSI011-RESPUESTA
           END-IF.
       FINGRESA-USR.
           EXIT.

       MODIFICA-USR.
           MOVE INSSI011-USIGLO21  TO USR-SIGLO21 OF T95BAN04.
           PERFORM MOVER-DATOS-USR-BANCS THRU FMOVER-DATOS-USR-BANCS.
	   IF USR-SIGLO21 OF T95BAN04 EQUAL SPACES OR
	      USR-SIGLO21 OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FMODIFICA-USR
           END-IF
           IF USR-BANCS   OF T95BAN04 EQUAL SPACES OR
	      USR-BANCS   OF T95BAN04 EQUAL ZEROS  OR 
	      USR-BANCS   OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FMODIFICA-USR
           END-IF
           IF TERM-NO OF T95BAN04 EQUAL SPACES OR
	      TERM-NO OF T95BAN04 EQUAL ZEROS  OR 
	      TERM-NO OF T95BAN04 EQUAL LOW-VALUES 
	      GO TO FMODIFICA-USR
           END-IF
      *    DISPLAY 'SSITP011: USRS21  ' USR-SIGLO21 OF T95BAN04
      *    DISPLAY 'SSITP011: UBANCS  ' USR-BANCS OF T95BAN04 
      *    DISPLAY 'SSITP011: NOMBRE  ' USR-NOMBRE OF T95BAN04 
      *    DISPLAY 'SSITP011: BRANCH  ' BRANCH-NO OF T95BAN04  
      *    DISPLAY 'SSITP011: TERMIN  ' TERM-NO OF T95BAN04     
      *    DISPLAY 'SSITP011: EMPRESA ' COD-EMPRESA OF T95BAN04 
      *    DISPLAY 'SSITP011: ESTPROC ' EST-PROCESO OF T95BAN04	 
      *    DISPLAY 'SSITP011: OBSERV  ' OBSERVACION OF T95BAN04
      *    DISPLAY 'SSITP011: UCAMBIO ' USR-ULT-CAMBIO OF T95BAN04 

           EXEC SQL
                UPDATE T95BAN04
                SET    USR_BANCS      = :T95BAN04.USR-BANCS,
                       USR_NOMBRE     = :T95BAN04.USR-NOMBRE,
                       BRANCH_NO      = :T95BAN04.BRANCH-NO,
                       TERM_NO        = :T95BAN04.TERM-NO, 
                       COD_EMPRESA    = :T95BAN04.COD-EMPRESA,
                       EST_PROCESO    = :T95BAN04.EST-PROCESO,
                       OBSERVACION    = :T95BAN04.OBSERVACION,
                       FEC_ULT_CAMBIO = SYSTIMESTAMP,
                       USR_ULT_CAMBIO = :T95BAN04.USR-ULT-CAMBIO 
                WHERE  USR_SIGLO21    = :T95BAN04.USR-SIGLO21 
           END-EXEC.
           DISPLAY 'SSITP011-MOD: SQLCODE ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
	      MOVE SQLCODE TO NUM-RESP
              IF SQLCODE EQUAL 100
                 MOVE 'TC'    TO INSSI011-ESTPROCESO
		             EST-PROCESO OF T95BAN04
                 PERFORM INGRESA-USR THRU FINGRESA-USR
              ELSE
                 IF SQLCODE LESS ZEROS
                    IF SQLCODE EQUAL -1
                     MOVE -1  TO M15UBANL
		     MOVE 'Usuario Bancs Duplicado' TO RESPUESTA
                    ELSE
                      MOVE 'NO '   TO INSSI011-CODRES
                      MOVE 'Err T95BAN04 SqlCode=-' TO TXT-RESP
                      MOVE WS-RESPUESTA             TO RESPUESTA
                    END-IF
                  ELSE
                     MOVE 'NO '   TO INSSI011-CODRES
                     MOVE 'Modificacion fallida BAN04' 
				  TO TXT-RESP
                     MOVE WS-RESPUESTA             TO RESPUESTA
                  END-IF
                  GO TO ERROR-VALIDA-DATOS
              END-IF
           ELSE
              MOVE 9        TO M15UBANA
      *       MOVE 9        TO M15TBANA
              MOVE 'OK '   TO INSSI011-CODRES
              MOVE 'Modificacion OK          ' TO INSSI011-RESPUESTA
           END-IF.
       FMODIFICA-USR.
           EXIT.

       MODIFICA-ESTADO-BANCS.
      *    DISPLAY 'SSITP007-MOD-EST-BANCS=' USR-SIGLO21 OF T95BAN04
	   IF USR-SIGLO21 OF T95BAN04 EQUAL SPACES 
	      GO TO FMODIFICA-ESTADO-BANCS
           END-IF
           EXEC SQL
                UPDATE T95BAN04
                SET    EST_PROCESO    = :T95BAN04.EST-PROCESO,
                       OBSERVACION    = :T95BAN04.OBSERVACION,
                       FEC_ULT_CAMBIO = SYSTIMESTAMP,
                       USR_ULT_CAMBIO = :T95BAN04.USR-ULT-CAMBIO 
                WHERE  USR_SIGLO21    = :T95BAN04.USR-SIGLO21 
           END-EXEC.
	   DISPLAY 'SSITP011-MOD ESTADO SQLCODE = ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              IF SQLCODE LESS ZEROS
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Err T95BAN04 SqlCode=-' TO RESPUESTA
                 MOVE W-RESPUESTA              TO INSSI011-RESPUESTA
              ELSE
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Mod Estado fallido BAN04' TO INSSI011-RESPUESTA
              END-IF
           ELSE
              MOVE 'OK '   TO INSSI011-CODRES
              MOVE 'Mod Estodo BAN04 OK        ' TO INSSI011-RESPUESTA
           END-IF.
       FMODIFICA-ESTADO-BANCS.
           EXIT.

       ELIMINA-USR.
      *    DISPLAY 'SSITP007-ELI-USRS21 = ' USR-SIGLO21 OF T95BAN04
	   IF USR-SIGLO21 OF T95BAN04 EQUAL SPACES
	      GO TO ELIMINA-USR 
           END-IF
           EXEC SQL
                DELETE
                FROM   T95BAN04
                WHERE  USR_SIGLO21 = :T95BAN04.USR-SIGLO21
           END-EXEC.
	   DISPLAY 'SSITP007-ELI SQLCODE = ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              IF SQLCODE LESS ZEROS
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Err T95BAN04 SqlCode=-' TO RESPUESTA
                 MOVE W-RESPUESTA              TO INSSI011-RESPUESTA
              ELSE
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Eliminacion  fallida BAN04' TO INSSI011-RESPUESTA
              END-IF
           ELSE
              MOVE 'OK '   TO INSSI011-CODRES
              MOVE 'Eliminacion  OK          ' TO INSSI011-RESPUESTA
           END-IF.
       FELIMINA-USR.
           EXIT.

       ELIMINA-OBSERVACION.
           MOVE P015-SIGLO21 TO COD-USUARIO OF T95OBS04
           EXEC SQL
                DELETE
                FROM   M2D.T95OBS04
                WHERE  COD_USUARIO = :T95OBS04.COD-USUARIO
           END-EXEC.
	   DISPLAY 'SSITP007-ELI OBSERVACION = ' SQLCODE
           IF ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              IF SQLCODE LESS ZEROS
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Err T95OBS04 SqlCode=-' TO RESPUESTA
                 MOVE W-RESPUESTA              TO INSSI011-RESPUESTA
              ELSE
                 MOVE 'NO '   TO INSSI011-CODRES
                 MOVE 'Eliminacion  fallida OBS04' TO INSSI011-RESPUESTA
              END-IF
           ELSE
              MOVE 'OK '   TO INSSI011-CODRES
              MOVE 'Eliminacion  OK          ' TO INSSI011-RESPUESTA
           END-IF.
       FELIMINA-OBSERVACION.
           EXIT.


       MOVER-DATOS-USR-BANCS.
           INITIALIZE T95BAN04.
      *    DISPLAY 'SSITP011: MOVER-DATOS-USR-BANCS : '
      *    DISPLAY 'SSITP001: ----------------------------- '
      *    DISPLAY 'SSITP011: TIPO    ' INSSI011-TIPO
      *    DISPLAY 'SSITP011: USIGLO  ' INSSI011-USIGLO21   
      *    DISPLAY 'SSITP011: UBANCS  ' INSSI011-UBANCS     
      *    DISPLAY 'SSITP011: NOMBRE  ' INSSI011-NOMBRE     
      *    DISPLAY 'SSITP011: BRANCH  ' INSSI011-BRANCHNO   
      *    DISPLAY 'SSITP011: TERMIN  ' INSSI011-STERMNO     
      *    DISPLAY 'SSITP011: EMPRESA ' INSSI011-EMPRESA    
      *    DISPLAY 'SSITP011: ESTPROC ' INSSI011-ESTPROCESO 
      *    DISPLAY 'SSITP011: OBSERV  ' INSSI011-OBSERVACION
      *    DISPLAY 'SSITP011: UCAMBIO ' INSSI011-UCAMBIO    
      *    DISPLAY 'SSITP001: ----------------------------- '

           MOVE INSSI011-USIGLO21    TO USR-SIGLO21    OF T95BAN04.
           MOVE INSSI011-UBANCS      TO USR-BANCS      OF T95BAN04.
           MOVE INSSI011-NOMBRE      TO USR-NOMBRE     OF T95BAN04.
           MOVE INSSI011-BRANCHNO    TO BRANCH-NO      OF T95BAN04.
           MOVE INSSI011-STERMNO     TO TERMINAL-BANCS.
           MOVE TERMNO-BANCS         TO TERM-NO        OF T95BAN04.
           MOVE INSSI011-EMPRESA     TO COD-EMPRESA    OF T95BAN04.
           MOVE INSSI011-ESTPROCESO  TO EST-PROCESO    OF T95BAN04.
           MOVE INSSI011-OBSERVACION TO OBSERVACION    OF T95BAN04.
           MOVE INSSI011-UCAMBIO     TO USR-ULT-CAMBIO OF T95BAN04.
       FMOVER-DATOS-USR-BANCS.
           EXIT.

       MOVER-DATOS-LEIDOS-BANCS.
           MOVE USR-SIGLO21     OF T95BAN04 TO INSSI011-USIGLO21.
           MOVE USR-BANCS       OF T95BAN04 TO INSSI011-UBANCS
				   M15UBANO
           MOVE USR-NOMBRE      OF T95BAN04 TO INSSI011-NOMBRE.
           MOVE BRANCH-NO       OF T95BAN04 TO INSSI011-BRANCHNO.
           MOVE TERMNO-BANCS    TO INSSI011-STERMNO
	   MOVE TERMINAL-BANCS  TO M15TBANO
           MOVE COD-EMPRESA     OF T95BAN04 TO INSSI011-EMPRESA.
           MOVE EST-PROCESO     OF T95BAN04 TO INSSI011-ESTPROCESO.
           MOVE OBSERVACION     OF T95BAN04 TO INSSI011-OBSERVACION.
           MOVE USR-ULT-CAMBIO  OF T95BAN04 TO INSSI011-UCAMBIO.
       FMOVER-DATOS-LEIDOS-BANCS.
           EXIT.