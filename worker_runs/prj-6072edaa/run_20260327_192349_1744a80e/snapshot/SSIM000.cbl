      **  DESCRIPCION...: Gestiona el men� principal de Seguridad   **

       IDENTIFICATION DIVISION.
       PROGRAM-ID. PRG000.
       ENVIRONMENT DIVISION.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  W-ABSTIME PIC S9(15) COMP-3.
       01  W-DATE.
           05 W-DAY PIC 99.
           05 FILLER PIC X.
           05 W-MONTH PIC 99.
           05 FILLER PIC X.
           05 W-YEAR PIC 9999.
       01  W-FECHA.
           05 W-DD PIC 99.
           05 FILLER PIC X VALUE '/'.
           05 W-MM PIC XXX.
           05 FILLER PIC X VALUE '/'.
           05 W-AA PIC 9999.
       01  W-T PIC X(36) VALUE 'EneFebMarAbrMayJunJulAgoSepOctNovDic'.
       01  FILLER REDEFINES W-T.
           05 W-NMES OCCURS 12 PIC XXX.
       01  W-HORA PIC X(8).
       01  W-USERID PIC X(8).
       01  W-OPID PIC XXX.
       01  W-APPLID PIC X(8).
       01  W-UNATTEND PIC X.
       01  W-COMMAREA.
           05 W-COMMFLAG PIC X.
       01  W-ERROR PIC 999.
       01  W-ERRORX REDEFINES W-ERROR PIC XXX.
       01  W-PROGRAMA PIC X(8) VALUE SPACES.
       01  FILLER REDEFINES W-PROGRAMA.
           05 W-PGM   PIC X(8).
       01  W-ERASE PIC X VALUE 'N'.
       COPY DFHAID.
       COPY PRG00M.
       LINKAGE SECTION.
       01  DFHCOMMAREA PIC X.
       PROCEDURE DIVISION.
           EXEC CICS ASSIGN USERID(W-USERID) APPLID(W-APPLID) END-EXEC.
           IF W-USERID = SPACES
                 PERFORM 1300-FINAL THRU 1400-FFINAL
           END-IF.
           IF EIBCALEN EQUAL ZEROS OR EIBAID EQUAL DFHPF5
              MOVE LOW-VALUES TO PRG00M1O
              MOVE 'S' TO W-ERASE
              MOVE 'A' TO W-COMMFLAG
           ELSE
              IF EIBAID EQUAL DFHCLEAR
                 PERFORM 1300-FINAL THRU 1400-FFINAL
              ELSE
                 MOVE DFHCOMMAREA TO W-COMMAREA
                 IF EIBAID EQUAL DFHPA1 OR DFHPA2 OR DFHPA3
                    MOVE LOW-VALUES TO PRG00M1O
                    MOVE 'Tecla invalida' TO M1MSG1O
                    MOVE SPACES TO M1MSG2O
                 ELSE
                    PERFORM 500-RECEIVE THRU 600-FRECEIVE
                    IF EIBRESP EQUAL DFHRESP(NORMAL)
                       PERFORM 100-INICIO THRU 200-FINICIO
                    ELSE
                       MOVE LOW-VALUES TO PRG00M1O
                       MOVE 'Error en receive del mapa' TO M1MSG1O
                       MOVE SPACES TO M1MSG2O
                    END-IF
                 END-IF
              END-IF
           END-IF.
           EXEC CICS ASSIGN APPLID(W-APPLID) OPID(W-OPID)
                     USERID(W-USERID) UNATTEND(W-UNATTEND) NOHANDLE
           END-EXEC.
           IF W-UNATTEND EQUAL LOW-VALUES
              PERFORM 700-SEND THRU 800-FSEND
              PERFORM 900-RETURN THRU 1000-FRETURN
           ELSE
              PERFORM 1300-FINAL THRU 1400-FFINAL
           END-IF.
           GOBACK.
       100-INICIO.
           MOVE SPACES TO M1MSG2O.
           IF M1OPCIOI NOT NUMERIC
              MOVE 'Ingrese un valor numerico' TO M1MSG1O
           ELSE
              IF NOT ( M1OPCIOI EQUAL 1 OR 2 OR 3 OR 4 OR 5
                       OR 6 OR 7 OR 8 OR 9 OR 10 )
                 MOVE 'Opcion invalida ' TO M1MSG1O
              ELSE
                 PERFORM 300-XCTL THRU 400-FXCTL
              END-IF
           END-IF.
       200-FINICIO.
           EXIT.
       300-XCTL.
           MOVE SPACES TO W-PROGRAMA.
           EVALUATE M1OPCIOI
               WHEN 1
                  MOVE 'SSITP002' TO W-PGM
               WHEN 2
                  MOVE 'PRG004  ' TO W-PGM
               WHEN 3
                  MOVE 'PRG005  ' TO W-PGM
               WHEN 4
                  MOVE 'PRG012  ' TO W-PGM
               WHEN 5
                  MOVE 'PRG032  ' TO W-PGM
               WHEN 6
                  MOVE 'PRG009  ' TO W-PGM
               WHEN 7
                  MOVE 'PRG010  ' TO W-PGM
               WHEN 8
                  MOVE 'PRG033  ' TO W-PGM
               WHEN 9
                  MOVE 'SSITP009' TO W-PGM
           END-EVALUATE.
           EXEC CICS XCTL PROGRAM(W-PROGRAMA) NOHANDLE END-EXEC.
           MOVE 'Error xxx XCTL ' TO M1MSG1O.
           MOVE EIBRESP TO W-ERROR.
           MOVE W-ERRORX TO M1MSG1O (7:3).
           MOVE W-PROGRAMA TO M1MSG1O (16:8).
       400-FXCTL.
           EXIT.
       500-RECEIVE.
           EXEC CICS RECEIVE MAP('PRG00M1') MAPSET('PRG00M') NOHANDLE
                END-EXEC.
       600-FRECEIVE.
           EXIT.
       700-SEND.
           PERFORM 1100-FECHA THRU 1200-FFECHA.
           MOVE W-USERID TO M1OPIDO.
           MOVE W-FECHA TO M1FECHAO.
           MOVE W-APPLID TO M1APPLDO.
           MOVE EIBTRMID TO M1TERMO.
           MOVE W-HORA TO M1HORAO.
           MOVE -1 TO M1OPCIOL.
           IF W-ERASE EQUAL 'S'
              EXEC CICS SEND MAP('PRG00M1') MAPSET('PRG00M') ERASE
                        CURSOR
              END-EXEC
           ELSE
              EXEC CICS SEND MAP('PRG00M1') MAPSET('PRG00M') CURSOR
                        DATAONLY
              END-EXEC
           END-IF.
       800-FSEND.
           EXIT.
       900-RETURN.
           EXEC CICS RETURN TRANSID('PRG0') COMMAREA(W-COMMAREA)
                     LENGTH(LENGTH OF W-COMMAREA)
           END-EXEC.
       1000-FRETURN.
           EXIT.
       1100-FECHA.
           EXEC CICS ASKTIME ABSTIME(W-ABSTIME) END-EXEC.
           EXEC CICS FORMATTIME ABSTIME(W-ABSTIME) DDMMYYYY(W-DATE)
                     DATESEP('/') TIME(W-HORA) TIMESEP(':')
           END-EXEC.
           MOVE W-DAY TO W-DD.
           MOVE W-NMES ( W-MONTH ) TO W-MM.
           MOVE W-YEAR TO W-AA.
       1200-FFECHA.
           EXIT.
       1300-FINAL.
      *    EXEC CICS ISSUE ERASEAUP END-EXEC.
           EXEC CICS RETURN END-EXEC.
       1400-FFINAL.
           EXIT.