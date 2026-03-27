      ****************************************************************
      **                        N E X T I                           **
      ****************************************************************
      **                                                            **
      **  DESCRIPCION...: Operaciones funcionales a la tabla de     **
      **                  usuarios                                  **
      **                                                            **
      ****************************************************************

       IDENTIFICATION DIVISION.
       PROGRAM-ID.  SSITP002.
       AUTHOR. STALYN MELO.
      *****************************************************************
      *  CONSULTA GENERAL DE USUARIOS TABLA T95USU03                 *
      *****************************************************************
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER.     IBM-4381.				 --
       OBJECT-COMPUTER.     IBM-4381.
       SPECIAL-NAMES.      DECIMAL-POINT IS COMMA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       77  ITEMNUM                 PIC S9(4) COMP.
       77  CONTAUSR                PIC 9(04) VALUE ZEROS.
       77  WS-PAGINAR              PIC S9(05) VALUE ZEROS.
       77  WS-ATRAS                PIC X VALUE 'N'.
       77  S-CODIGO                PIC X(08) VALUES SPACES.
       77  S-EMPRESA               PIC X(04) VALUES SPACES.
       77  S-CENTRO                PIC X(04) VALUES SPACES.
       77  S-PERFIL                PIC X(08) VALUES SPACES.
       77  S-NOMBRE                PIC X(40) VALUES SPACES.
       77  W-FLAG                  PIC X VALUE '0'.
       77  W-CONTADOR              PIC 9(5) COMP-3.
       77  FIN-ARC                 PIC X  VALUE 'N'.
       77  AUTORIZA                PIC S9(10) COMP-3.
       77  CIDELA                  PIC S9(10) COMP-3.
       77  CIDUSR                  PIC S9(10) COMP-3.
       77  W-INICIO                PIC  9(2) VALUE ZEROS.
       77  W-USERID                PIC X(8) VALUE SPACES.
       77  W-APPLID                PIC X(8) VALUE SPACES.
       77  I                       PIC 9(03)   VALUE ZEROS.
       77  INDICE                  PIC 9(02)   VALUE ZEROS.
       77  W-LI                    PIC 9(02)   VALUE 8.
       77  W-LF                    PIC 9(02)   VALUE 21.
       77  W-X1                    PIC 9(04)   VALUE ZEROS.
       77  W-X2                    PIC 9(04)   VALUE ZEROS.
       77  ENTRO                   PIC X       VALUE SPACES.
       01  W-CUOCIENTE             PIC 9(5) COMP-3.
       01  W-RESIDUO               PIC 9(5) COMP-3.
       01  EMPRESAIN               PIC X(04).
       01  FILLER REDEFINES EMPRESAIN.
           03 EMPIN OCCURS 4       PIC X.
       01  CENTROIN                PIC X(04).
       01  FILLER REDEFINES CENTROIN.
           03 CENIN OCCURS 4       PIC X.
       01  USUARIOIN               PIC X(08).
       01  FILLER REDEFINES USUARIOIN.
           03 USRIN OCCURS 8       PIC X.
       01  PERFILIN               PIC X(08).
       01  FILLER REDEFINES PERFILIN.
           03 PERIN OCCURS 8       PIC X.
       01  NOMBREIN               PIC X(40).
       01  FILLER REDEFINES NOMBREIN.
           03 NOMIN OCCURS 40      PIC X.
       01  NOMBRE-AUX              PIC X(40).
       01  FILLER REDEFINES NOMBRE-AUX.
           03 NOMB OCCURS 40       PIC X.
       01  CODIGO-AUX              PIC X(08).
       01  FILLER REDEFINES CODIGO-AUX.
           03 CODI OCCURS 8        PIC X.
       01  PUNTERO USAGE IS POINTER.
       01  PUNTERON REDEFINES PUNTERO PIC S9(8) COMP.
       01  W-PDETALLE.
           03 W-PSELECCION            PIC X(03).
           03 FILLER                  PIC XX.
           03 W-PCLAVE                PIC X(08).
           03 FILLER                  PIC XX.
           03 W-PNOMBRE               PIC X(30).
           03 FILLER                  PIC XX.
           03 W-PPERFIL               PIC X(08).
           03 FILLER                  PIC XX.
           03 W-PEMPRESA              PIC X(04).
           03 FILLER                  PIC X.
           03 W-PCENTRO               PIC X(04).
           03 FILLER                  PIC X.
           03 W-PDOMINIO              PIC X(04).
           03 FILLER                  PIC X.
           03 W-PNODO                 PIC X(04).
           03 FILLER                  PIC X.
           03 W-PAUTORIZA             PIC X.

           COPY SSIM002.
           COPY INSSI002.
           COPY INPRG015.
           COPY BFCHTIME.

       01  T95USU03.
           10 USR-SIGLO21          PIC X(8).
           10 USR-NOMBRE           PIC X(40).
           10 USR-STATUS           PIC X(1).
           10 USR-CID              PIC X(10).
           10 USR-OFFSET           PIC X(8).
           10 USR-CARGO            PIC X(15).
           10 USR-EMPRESA          PIC X(4).
           10 USR-CENTRO           PIC X(4).
           10 USR-PERS             PIC X(8).
           10 USR-DOMINIO          PIC X(4).
           10 USR-NODO             PIC X(4).
           10 USR-AUTORIZA         PIC X(1).
           10 USR-UPDFCH           PIC X(8).
           10 USR-UPTIME           PIC X(6).
           10 USR-UPUSR            PIC X(8).
           10 USR-UPTERM           PIC X(4).
           10 USR-FCHLOGON         PIC X(8).
           10 USR-TIMELOGON        PIC X(6).
           10 USR-TOKEN            PIC X(8).
           10 USR-HISTORIA         PIC X(80).
           10 USR-FCHNEWPASS       PIC X(8).
           10 USR-FCHCAMBIO        PIC X(8).
           EXEC SQL
               INCLUDE SQLCA
           END-EXEC.
           EXEC SQL DECLARE T95USU03 TABLE
           ( USR_SIGLO21                    CHAR(8) NOT NULL,
             USR_NOMBRE                     CHAR(40) NOT NULL,
             USR_STATUS                     CHAR(1) NOT NULL,
             USR_CID                        CHAR(10) NOT NULL,
             USR_OFFSET                     CHAR(8) NOT NULL,
             USR_CARGO                      CHAR(15) NOT NULL,
             USR_EMPRESA                    CHAR(4) NOT NULL,
             USR_CENTRO                     CHAR(4) NOT NULL,
             USR_PERS                       CHAR(8) NOT NULL,
             USR_DOMINIO                    CHAR(4) NOT NULL,
             USR_NODO                       CHAR(4) NOT NULL,
             USR_AUTORIZA                   CHAR(1) NOT NULL,
             USR_UPDFCH                     CHAR(8) NOT NULL,
             USR_UPDTIME                    CHAR(6) NOT NULL,
             USR_UPDUSR                     CHAR(8) NOT NULL,
             USR_UPDTERM                    CHAR(4) NOT NULL,
             USR_FCHLOGON                   CHAR(8) NOT NULL,
             USR_TIMELOGON                  CHAR(6) NOT NULL,
             USR_TOKEN                      CHAR(8) NOT NULL,
             USR_HISTORIA                   CHAR(80) NOT NULL,
             USR_FCHNEWPASS                 CHAR(8) NOT NULL,
             USR_FCHCAMBIO                  CHAR(8) NOT NULL
           ) END-EXEC.
           EXEC SQL
              DECLARE CCODIGO CURSOR FOR
                 SELECT USR_SIGLO21, USR_NOMBRE, USR_PERS,
                        USR_EMPRESA, USR_CENTRO, USR_NODO,
                        USR_AUTORIZA, USR_DOMINIO
                    FROM M2D.T95USU03
                    WHERE USR_SIGLO21 LIKE :S-CODIGO
           END-EXEC.
           EXEC SQL
              DECLARE CEMPRESA CURSOR FOR
                 SELECT USR_SIGLO21, USR_NOMBRE, USR_PERS,
                        USR_EMPRESA, USR_CENTRO, USR_NODO,
                        USR_AUTORIZA, USR_DOMINIO
                    FROM M2D.T95USU03
                    WHERE USR_EMPRESA = :S-EMPRESA
           END-EXEC.
           EXEC SQL
              DECLARE CCENTRO CURSOR FOR
                 SELECT USR_SIGLO21, USR_NOMBRE, USR_PERS,
                        USR_EMPRESA, USR_CENTRO, USR_NODO,
                        USR_AUTORIZA, USR_DOMINIO
                    FROM M2D.T95USU03
                    WHERE USR_CENTRO = :S-CENTRO
           END-EXEC.
           EXEC SQL
              DECLARE CPERFIL  CURSOR FOR
                 SELECT USR_SIGLO21, USR_NOMBRE, USR_PERS,
                        USR_EMPRESA, USR_CENTRO, USR_NODO,
                        USR_AUTORIZA, USR_DOMINIO
                    FROM M2D.T95USU03
                    WHERE USR_PERS LIKE :S-CODIGO
           END-EXEC.
           EXEC SQL
              DECLARE CNOMBRE  CURSOR FOR
                 SELECT USR_SIGLO21, USR_NOMBRE, USR_PERS,
                        USR_EMPRESA, USR_CENTRO, USR_NODO,
                        USR_AUTORIZA, USR_DOMINIO
                    FROM M2D.T95USU03
                    WHERE USR_NOMBRE LIKE :S-NOMBRE
           END-EXEC.
       LINKAGE SECTION.
1326   01  DFHCOMMAREA      PIC X(1332).
       PROCEDURE DIVISION.
           EXEC CICS ASKTIME ABSTIME(WS-TIEMPO)          END-EXEC.
           EXEC CICS FORMATTIME  ABSTIME(WS-TIEMPO)
                                  YYMMDD(FECHA-HOY)
                                    TIME(HORA-ABS)
                                 TIMESEP
                                    YEAR(WS-ANIO-HOY)    END-EXEC.
           MOVE WS-ANIO-HOY  TO FS-AA.
           MOVE FH-MMDD      TO FS-MMDD.
           MOVE SPACES       TO W-PDETALLE.
           IF EIBCALEN = 0
              MOVE LOW-VALUES     TO   SSI0201O
              MOVE SPACES         TO   REG-INSSI02
              MOVE ZEROS          TO   SSI02-COMMAREA
              MOVE SPACES         TO   USR-SIGLO21
              MOVE 'F2-ADICION '  TO P02TEC1O
              PERFORM ENVIA-MAPA-01 THRU FENVIA-MAPA-01
           ELSE
              MOVE DFHCOMMAREA TO   REG-INSSI02
              PERFORM RECIBE-PANTALLA THRU FRECIBE-PANTALLA
              PERFORM ENVIA-MAPA-01 THRU FENVIA-MAPA-01
           END-IF.

       REGRESO.
           EXEC CICS RETURN
                     TRANSID ('I002')
                     COMMAREA (REG-INSSI02)
                     LENGTH (LENGTH OF REG-INSSI02)
           END-EXEC.

       ENVIA-MAPA-01.
      *     MOVE 'ENTER-MAS DATOS  F2-ADICION  F4-EDITAR  ' TO P02TEC1O.
           MOVE 'ENTER-MAS DATOS  F2-ADICION  F4-EDITAR  F7-PREVIO' 
             TO P02TEC1O

           MOVE 1             TO SSI02-COMMAREA.
           MOVE FECHA-SISTEMA TO P02FECHAO.
           MOVE HORA-ABS      TO P02HORAO.
           MOVE EIBTRMID      TO P02TERMO.
           EXEC CICS ASSIGN USERID(W-USERID) APPLID(W-APPLID) END-EXEC.
           MOVE W-USERID      TO P02USERO.
           MOVE W-APPLID      TO P02CICSO.
           MOVE -1            TO P02EMPL.
           EXEC CICS SEND
                     MAP('SSI0201')
                     MAPSET('SSIM002')
                     ERASE
                     CURSOR()
           END-EXEC.
       FENVIA-MAPA-01.
           EXIT.


       RECIBE-PANTALLA.
           EXEC CICS HANDLE AID ANYKEY(TERMINA-PGM)
                                CLEAR(TERMINA-PGM)
                                ENTER(TECLA-ENTER)
                                PF2(TECLA-PF2)
                                PF4(TECLA-PF4)
                                PF7(TECLA-PF7)
      *                         PF8(TECLA-PF8)
           END-EXEC.
           EXEC CICS RECEIVE MAP('SSI0201') MAPSET('SSIM002') END-EXEC.
       FRECIBE-PANTALLA.
           EXIT.


      *----------------------------------------------------------*
      * El usuario digito enter, validar el tipo de consulta que *
      * necesita, por usaurio, nombre, empresa, centro, perfil   *
      *----------------------------------------------------------*
       TECLA-ENTER.
           MOVE 'N' TO ENTRO.
           MOVE 1 TO I.
           PERFORM ENCERA-SSI002 VARYING I FROM I BY 1
                   UNTIL I GREATER 14.

NEL        IF P02NREO EQUAL SPACES OR LOW-VALUES OR
              P02NREI NOT NUMERIC
              MOVE 0       TO WS-PAGINAR
           ELSE 
              MOVE    P02NREI TO WS-PAGINAR

      *        DIVIDE WS-PAGINAR BY 14 GIVING W-CUOCIENTE
      *                  REMAINDER W-RESIDUO

      *       IF W-RESIDUO NOT EQUAL ZEROS AND WS-ATRAS EQUAL 'N'
      *           PERFORM REGRESO
      *        END-IF

              IF WS-ATRAS EQUAL 'S'
                 COMPUTE WS-PAGINAR = WS-PAGINAR - 28
                 IF WS-PAGINAR < 0 
                    MOVE 0       TO P02NREO WS-PAGINAR
                    MOVE 'Inicio de los datos' TO P02DET1O
                 END-IF
              END-IF
           END-IF.

           DISPLAY 'SSITP002-PAG = ' WS-PAGINAR
 
           IF P02EMPL > 0
              MOVE P02EMPI TO EMPRESAIN
              IF EMPIN(1) NOT = SPACES
                 MOVE 'S' TO ENTRO
                 PERFORM CONSUL-EMPRESA THRU FCONSUL-EMPRESA
              END-IF
           END-IF.
           IF P02CENL > 0 AND ENTRO = 'N'
              MOVE P02CENI TO CENTROIN
              IF CENIN(1) NOT = SPACES
                 MOVE 'S' TO ENTRO
                 PERFORM CONSUL-CENTRO  THRU FCONSUL-CENTRO
              END-IF
           END-IF
           IF P02USRL > 0 AND ENTRO = 'N'
              MOVE P02USRI TO USUARIOIN
              IF USRIN(1) NOT = SPACES
                 MOVE 'S' TO ENTRO
                 PERFORM CONSUL-USUARIO THRU FCONSUL-USUARIO
              END-IF
           END-IF.
           IF P02PERL > 0 AND ENTRO = 'N'
              MOVE P02PERI TO PERFILIN
              IF PERIN(1) NOT = SPACES
                 MOVE 'S' TO ENTRO
                 PERFORM CONSUL-PERFIL  THRU FCONSUL-PERFIL
              END-IF
           END-IF.
           IF P02NOML > 0 AND ENTRO = 'N'
              MOVE P02NOMI TO NOMBREIN
              IF NOMIN(1) NOT = SPACES
                 MOVE 'S' TO ENTRO
                 PERFORM CONSUL-NOMBRE  THRU FCONSUL-NOMBRE
              END-IF
           END-IF.
           IF ENTRO = 'N'
              MOVE 'Ingrese Criterio Consulta' TO P02DET1O
           ELSE
              MOVE 'ENTER-MAS DATOS  F2-ADICION  F4-EDITAR  F7-PREVIO' 
                TO P02TEC1O
           END-IF.
           PERFORM ENVIA-MAPA-01 THRU FENVIA-MAPA-01.
           GO TO REGRESO.


      *----------------------------------------------------------*
      * Termina el programa, regresa al menu principal           *
      *----------------------------------------------------------*
       TERMINA-PGM.
           EXEC CICS XCTL PROGRAM('PRG000') END-EXEC.
           GOBACK.


      *----------------------------------------------------------*
      * Consulta datos por empresa a la que pertenece el usuario *
      *----------------------------------------------------------*
       CONSUL-EMPRESA.
           MOVE P02EMPI TO S-EMPRESA.
           EXEC SQL
              OPEN CEMPRESA
           END-EXEC.
           IF SQLCODE NOT LESS ZEROS AND SQLCODE NOT EQUAL 100
              PERFORM EMPRESA-OKOPEN THRU EMPRESA-FOKOPEN
           ELSE
              MOVE 'Error open cursor Empresa' TO P02DET1O
           END-IF.
       FCONSUL-EMPRESA.
           EXIT.
       EMPRESA-OKOPEN.
           MOVE ZEROS TO I W-CONTADOR.
           MOVE '0' TO W-FLAG.
           PERFORM EMPRESA-FETCH THRU EMPRESA-FFETCH
                   UNTIL W-FLAG NOT EQUAL '0'.

           IF W-FLAG EQUAL 1
              MOVE 'Existen mas Datos         ' TO P02DET1O
              COMPUTE W-CONTADOR = W-CONTADOR - 1
           ELSE
              MOVE 'No existen mas Datos      ' TO P02DET1O
           END-IF.

           MOVE W-CONTADOR TO P02NREO

           EXEC SQL
              CLOSE CEMPRESA
           END-EXEC.
       EMPRESA-FOKOPEN.
           EXIT.
       EMPRESA-FETCH.
           EXEC SQL
             FETCH CEMPRESA
              INTO :USR-SIGLO21, :USR-NOMBRE, :USR-PERS, :USR-EMPRESA,
                   :USR-CENTRO, :USR-NODO, :USR-DOMINIO, :USR-AUTORIZA
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              ADD 1 TO W-CONTADOR
              IF W-CONTADOR > WS-PAGINAR 
                 ADD 1 TO I
                 IF I < 15
                    PERFORM CONSUL-MOVE THRU CONSUL-FMOVE
                 ELSE
                    MOVE '1' TO W-FLAG
                 END-IF
              END-IF
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE '2' TO W-FLAG
                 MOVE 'Fin de Codigos' TO P02DET1O
              ELSE
                 MOVE '2' TO W-FLAG
                 MOVE 'Error grave tabla USUARIOS' TO P02DET1O
           END-IF.
       EMPRESA-FFETCH.
           EXIT.


      *----------------------------------------------------------*
      * Consulta datos por centros al que pertenece el usuario   *
      *----------------------------------------------------------*
       CONSUL-CENTRO.
           MOVE P02CENI TO S-CENTRO.
           EXEC SQL
              OPEN CCENTRO
           END-EXEC.
           IF SQLCODE NOT LESS ZEROS AND SQLCODE NOT EQUAL 100
              PERFORM CENTRO-OKOPEN THRU CENTRO-FOKOPEN
           ELSE
              MOVE 'Error open cursor CENTRO' TO P02DET1O
           END-IF.
       FCONSUL-CENTRO.
           EXIT.
       CENTRO-OKOPEN.
           MOVE ZEROS TO I W-CONTADOR.
           MOVE '0' TO W-FLAG.
           PERFORM CENTRO-FETCH THRU CENTRO-FFETCH
                   UNTIL W-FLAG NOT EQUAL '0'.

           IF W-FLAG EQUAL 1
              MOVE 'Existen mas Datos         ' TO P02DET1O
              COMPUTE W-CONTADOR = W-CONTADOR - 1
           ELSE
              MOVE 'No existen mas Datos      ' TO P02DET1O
           END-IF.

           MOVE W-CONTADOR TO P02NREO

           EXEC SQL
              CLOSE CCENTRO
           END-EXEC.
       CENTRO-FOKOPEN.
           EXIT.
       CENTRO-FETCH.
           EXEC SQL
             FETCH CCENTRO
              INTO :USR-SIGLO21, :USR-NOMBRE, :USR-PERS, :USR-EMPRESA,
                   :USR-CENTRO, :USR-NODO, :USR-DOMINIO, :USR-AUTORIZA
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              ADD 1 TO W-CONTADOR
              IF W-CONTADOR > WS-PAGINAR 
                 ADD 1 TO I
                 IF I < 15
                    PERFORM CONSUL-MOVE THRU CONSUL-FMOVE
                 ELSE
                    MOVE '1' TO W-FLAG
                 END-IF
              END-IF
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE '2' TO W-FLAG
                 MOVE 'Fin de Codigos' TO P02DET1O
              ELSE
                 MOVE '2' TO W-FLAG
                 MOVE 'Error grave tabla USUARIOS' TO P02DET1O
           END-IF.
       CENTRO-FFETCH.
           EXIT.

      *-------------------------------------------------------------*
      *                                                             *
      *-------------------------------------------------------------*
       CONSUL-USUARIO.
           MOVE P02USRI TO CODIGO-AUX.
           MOVE 1 TO I.
           PERFORM CONSUL-BUSCAB VARYING I FROM I BY 1
                   UNTIL I GREATER 8.
           MOVE CODIGO-AUX TO S-CODIGO.
           EXEC SQL
              OPEN CCODIGO
           END-EXEC.
           IF SQLCODE NOT LESS ZEROS AND SQLCODE NOT EQUAL 100
              PERFORM CONSUL-OKOPEN THRU CONSUL-FOKOPEN
           ELSE
              MOVE 'Error open cursor Usuarios' TO P02DET1O
           END-IF.
       FCONSUL-USUARIO.
           EXIT.
       CONSUL-OKOPEN.
           MOVE ZEROS TO I W-CONTADOR.
           MOVE '0' TO W-FLAG.
           PERFORM CONSUL-FETCH THRU CONSUL-FFETCH
                   UNTIL W-FLAG NOT EQUAL '0'.

           IF W-FLAG EQUAL 1
              MOVE 'Existen mas Datos         ' TO P02DET1O
              COMPUTE W-CONTADOR = W-CONTADOR - 1
           ELSE
              MOVE 'No existen mas Datos      ' TO P02DET1O
           END-IF.

           MOVE W-CONTADOR TO P02NREO

           EXEC SQL
              CLOSE CCODIGO
           END-EXEC.
       CONSUL-FOKOPEN.
           EXIT.
       CONSUL-FETCH.
           EXEC SQL
             FETCH CCODIGO
              INTO :USR-SIGLO21, :USR-NOMBRE, :USR-PERS, :USR-EMPRESA,
                   :USR-CENTRO, :USR-NODO, :USR-DOMINIO, :USR-AUTORIZA
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              ADD 1 TO W-CONTADOR
              IF W-CONTADOR > WS-PAGINAR 
                 ADD 1 TO I
                 IF I < 15
                    PERFORM CONSUL-MOVE THRU CONSUL-FMOVE
                 ELSE
                    MOVE '1' TO W-FLAG
                 END-IF
              END-IF
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE '2' TO W-FLAG
                 MOVE 'Fin de Codigos' TO P02DET1O
              ELSE
                 MOVE '2' TO W-FLAG
                 MOVE 'Error grave tabla USUARIOS' TO P02DET1O
           END-IF.
       CONSUL-FFETCH.
           EXIT.
       CONSUL-MOVE.
           ADD 1 TO CONTAUSR.
           MOVE USR-SIGLO21       TO SSI02-CLAVE(I).
           MOVE USR-NOMBRE        TO SSI02-NOMBRE(I).
           MOVE USR-PERS          TO SSI02-PERFIL(I).
           MOVE USR-EMPRESA       TO SSI02-EMPRESA(I).
           MOVE USR-CENTRO        TO SSI02-CENTRO(I).
           MOVE USR-NODO          TO SSI02-NODO(I).
           MOVE USR-DOMINIO       TO SSI02-DOMINIO(I).
           MOVE USR-AUTORIZA      TO SSI02-AUTORIZA(I).
           MOVE I                 TO W-PSELECCION.
           MOVE SSI02-CLAVE(I)    TO W-PCLAVE.
           MOVE SSI02-NOMBRE(I)   TO W-PNOMBRE.
           MOVE SSI02-PERFIL(I)   TO W-PPERFIL.
           MOVE SSI02-EMPRESA(I)  TO W-PEMPRESA.
           MOVE SSI02-CENTRO(I)   TO W-PCENTRO.
           MOVE SSI02-NODO(I)     TO W-PNODO.
           MOVE SSI02-DOMINIO(I)  TO W-PDOMINIO.
           MOVE SSI02-AUTORIZA(I) TO W-PAUTORIZA.
           MOVE W-PDETALLE        TO P02DETAO(I).
       CONSUL-FMOVE.
           EXIT.
       CONSUL-BUSCAB.
           IF CODI(I) = ' '
              MOVE '%' TO CODI(I)
           END-IF.
       CONSUL-BUSCANOMBRE.
           IF NOMB(I) = ' '
              MOVE '%' TO NOMB(I)
           END-IF.


      *-------------------------------------------------------------*
      *  consulta datos por perfil de usuario                       *
      *-------------------------------------------------------------*
       CONSUL-PERFIL.
           MOVE P02PERI TO CODIGO-AUX.
           MOVE 1 TO I.
           PERFORM CONSUL-BUSCAB VARYING I FROM I BY 1
                   UNTIL I GREATER 8.
           MOVE CODIGO-AUX TO S-CODIGO.
           EXEC SQL
              OPEN CPERFIL
           END-EXEC.
           IF SQLCODE NOT LESS ZEROS AND SQLCODE NOT EQUAL 100
              PERFORM PERFIL-OKOPEN THRU PERFIL-FOKOPEN
           ELSE
              MOVE 'Error open cursor Usuarios' TO P02DET1O
           END-IF.
       FCONSUL-PERFIL.
           EXIT.

       PERFIL-OKOPEN.
           MOVE ZEROS      TO I W-CONTADOR.
           MOVE '0' TO W-FLAG.
           PERFORM PERFIL-FETCH THRU PERFIL-FFETCH
                   UNTIL W-FLAG NOT EQUAL '0'.
NEL   *     IF CONTAUSR > 0
      *        MOVE 'No existen Datos          ' TO P02DET1O
      *     END-IF.
           IF W-FLAG EQUAL 1
              MOVE 'Existen mas Datos         ' TO P02DET1O
              COMPUTE W-CONTADOR = W-CONTADOR - 1
           ELSE
              MOVE 'No existen mas Datos      ' TO P02DET1O
           END-IF.

           MOVE W-CONTADOR TO P02NREO

           EXEC SQL
              CLOSE CPERFIL
           END-EXEC.
       PERFIL-FOKOPEN.
           EXIT.

       PERFIL-FETCH.
           EXEC SQL
             FETCH CPERFIL
              INTO :USR-SIGLO21, :USR-NOMBRE, :USR-PERS, :USR-EMPRESA,
                   :USR-CENTRO, :USR-NODO, :USR-DOMINIO, :USR-AUTORIZA
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              ADD 1 TO W-CONTADOR
NEL           IF W-CONTADOR > WS-PAGINAR 
                 ADD 1 TO I
                 IF I < 15
                    PERFORM CONSUL-MOVE THRU CONSUL-FMOVE
                 ELSE
                    MOVE '1' TO W-FLAG
                 END-IF
              END-IF
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE '2' TO W-FLAG
                 MOVE 'Fin de Codigos' TO P02DET1O
              ELSE
                 MOVE '2' TO W-FLAG
                 MOVE 'Error grave tabla USUARIOS' TO P02DET1O
           END-IF.
       PERFIL-FFETCH.
           EXIT.

      *-------------------------------------------------------------*
      *  Consulta de usuario por nombre                             *
      *-------------------------------------------------------------*
       CONSUL-NOMBRE.
           MOVE P02NOMI TO NOMBRE-AUX.
           MOVE 1 TO I.
           PERFORM CONSUL-BUSCANOMBRE VARYING I FROM I BY 1
                   UNTIL I GREATER 40.
           MOVE NOMBRE-AUX TO S-NOMBRE.
           EXEC SQL
              OPEN CNOMBRE
           END-EXEC.
           IF SQLCODE NOT LESS ZEROS AND SQLCODE NOT EQUAL 100
              PERFORM NOMBRE-OKOPEN THRU NOMBRE-FOKOPEN
           ELSE
              MOVE 'Error open cursor Usuarios' TO P02DET1O
           END-IF.
       FCONSUL-NOMBRE.
           EXIT.
       NOMBRE-OKOPEN.
           MOVE ZEROS TO I W-CONTADOR.
           MOVE '0' TO W-FLAG.
           PERFORM NOMBRE-FETCH THRU NOMBRE-FFETCH
                   UNTIL W-FLAG NOT EQUAL '0'.

           IF W-FLAG EQUAL 1
              MOVE 'Existen mas Datos         ' TO P02DET1O
              COMPUTE W-CONTADOR = W-CONTADOR - 1
           ELSE
              MOVE 'No existen mas Datos      ' TO P02DET1O
           END-IF.

           MOVE W-CONTADOR TO P02NREO

           EXEC SQL
              CLOSE CNOMBRE
           END-EXEC.
       NOMBRE-FOKOPEN.
           EXIT.
       NOMBRE-FETCH.
           EXEC SQL
             FETCH CNOMBRE
              INTO :USR-SIGLO21, :USR-NOMBRE, :USR-PERS, :USR-EMPRESA,
                   :USR-CENTRO, :USR-NODO, :USR-DOMINIO, :USR-AUTORIZA
           END-EXEC.
           IF NOT ( SQLCODE EQUAL 100 OR SQLCODE LESS ZEROS )
              ADD 1 TO W-CONTADOR
              IF W-CONTADOR > WS-PAGINAR 
                 ADD 1 TO I
                 IF I < 15
                    PERFORM CONSUL-MOVE THRU CONSUL-FMOVE
                 ELSE
                    MOVE '1' TO W-FLAG
                 END-IF
              END-IF
           ELSE
              IF SQLCODE EQUAL 100
                 MOVE '2' TO W-FLAG
                 MOVE 'Fin de Codigos' TO P02DET1O
              ELSE
                 MOVE '2' TO W-FLAG
                 MOVE 'Error grave tabla USUARIOS' TO P02DET1O
           END-IF.
       NOMBRE-FFETCH.
           EXIT.


      *-------------------------------------------------------------*
      *  Se encera el commarea que se utiliza para trabajar         *
      *-------------------------------------------------------------*
       ENCERA-SSI002.
           MOVE SPACES TO SSI02-CLAVE(I).



      *-------------------------------------------------------------*
      *  Se edita un registro para eso se llama al programa SSITP007*
      *-------------------------------------------------------------*
       TECLA-PF2.
           MOVE SPACES          TO REG-INTP015.
           MOVE '0'             TO P015-COMMAREA.
           MOVE 'C'             TO P015-TIPO.
           EXEC CICS XCTL PROGRAM('SSITP007')
                COMMAREA(REG-INTP015)
                  LENGTH(LENGTH OF REG-INTP015)
                NOHANDLE
           END-EXEC.




      *-------------------------------------------------------------*
      *  Se edita un registro para eso se llama al programa SSITP007*
      *-------------------------------------------------------------*
       TECLA-PF4.
           IF P02SELI > 0 AND P02SELI < 15
              MOVE P02SELI  TO I
              IF SSI02-CLAVE(I) NOT = SPACES
                 MOVE SPACES          TO REG-INTP015
                 MOVE '2'             TO P015-COMMAREA
                 MOVE 'C'             TO P015-TIPO
                 MOVE SSI02-CLAVE(I)  TO P015-SIGLO21
                 EXEC CICS XCTL PROGRAM('SSITP007')
                               COMMAREA(REG-INTP015)
                                 LENGTH(LENGTH OF REG-INTP015)
                               NOHANDLE
                 END-EXEC
              ELSE
                 MOVE 'Seleccion Errada          ' TO P02DET1O
                 PERFORM ENVIA-MAPA-01 THRU FENVIA-MAPA-01
                 GO TO REGRESO
           END-IF.
	   GO TO REGRESO.

      *-------------------------------------------------------------*
      *  PAGINA LA CONSULTA HACIA ADELANTE                          *
      *-------------------------------------------------------------*
       TECLA-PF7.
           MOVE 'S' TO WS-ATRAS.
           PERFORM TECLA-ENTER.