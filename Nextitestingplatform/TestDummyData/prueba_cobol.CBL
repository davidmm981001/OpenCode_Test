       IDENTIFICATION DIVISION.
       PROGRAM-ID. ORACLESTRESS.
       AUTHOR. TEST.
       DATE-WRITTEN. 2026.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.

       EXEC SQL INCLUDE SQLCA END-EXEC.

       01 WS-COUNT            PIC 9(9) VALUE 0.
       01 WS-TOTAL            PIC 9(9) VALUE 20000.
       01 WS-BATCH-SIZE       PIC 9(5) VALUE 500.
       01 WS-MOD              PIC 9(9).

       EXEC SQL
          BEGIN DECLARE SECTION
       END-EXEC.

       01 DB-USER             PIC X(30) VALUE "user".
       01 DB-PASS             PIC X(30) VALUE "password".

       01 EMP-ID              PIC 9(9).
       01 EMP-NAME            PIC X(50).
       01 EMP-SAL             PIC 9(9)V99.

       EXEC SQL
          END DECLARE SECTION
       END-EXEC.

       PROCEDURE DIVISION.

       MAIN-SECTION.

           DISPLAY "INICIO STRESS TEST ORACLE".

           EXEC SQL
              CONNECT :DB-USER IDENTIFIED BY :DB-PASS
           END-EXEC.

           IF SQLCODE NOT = 0
              DISPLAY "ERROR CONECTANDO A ORACLE"
              DISPLAY SQLCODE
              STOP RUN
           END-IF.

           PERFORM INSERT-SECTION.

           PERFORM CURSOR-SECTION.

           PERFORM PLSQL-SECTION.

           DISPLAY "FIN PROCESO".
           STOP RUN.
      *--------------------------------------------------
      * INSERT BLOQUE 1
      *--------------------------------------------------

       INSERT-SECTION-1.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 1" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 1"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 2
      *--------------------------------------------------

       INSERT-SECTION-2.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 2" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 2"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 3
      *--------------------------------------------------

       INSERT-SECTION-3.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 3" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 3"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 4
      *--------------------------------------------------

       INSERT-SECTION-4.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 4" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 4"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 5
      *--------------------------------------------------

       INSERT-SECTION-5.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 5" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 5"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 6
      *--------------------------------------------------

       INSERT-SECTION-6.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 6" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 6"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 7
      *--------------------------------------------------

       INSERT-SECTION-7.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 7" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 7"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 8
      *--------------------------------------------------

       INSERT-SECTION-8.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 8" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 8"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 9
      *--------------------------------------------------

       INSERT-SECTION-9.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 9" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 9"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 10
      *--------------------------------------------------

       INSERT-SECTION-10.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 10" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 10"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 11
      *--------------------------------------------------

       INSERT-SECTION-11.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 11" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 11"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 12
      *--------------------------------------------------

       INSERT-SECTION-12.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 12" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 12"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 13
      *--------------------------------------------------

       INSERT-SECTION-13.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 13" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 13"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 14
      *--------------------------------------------------

       INSERT-SECTION-14.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 14" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 14"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 15
      *--------------------------------------------------

       INSERT-SECTION-15.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 15" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 15"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 16
      *--------------------------------------------------

       INSERT-SECTION-16.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 16" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 16"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 17
      *--------------------------------------------------

       INSERT-SECTION-17.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 17" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 17"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 18
      *--------------------------------------------------

       INSERT-SECTION-18.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 18" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 18"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 19
      *--------------------------------------------------

       INSERT-SECTION-19.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 19" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 19"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 20
      *--------------------------------------------------

       INSERT-SECTION-20.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 20" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 20"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 21
      *--------------------------------------------------

       INSERT-SECTION-21.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 21" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 21"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 22
      *--------------------------------------------------

       INSERT-SECTION-22.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 22" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 22"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 23
      *--------------------------------------------------

       INSERT-SECTION-23.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 23" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 23"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 24
      *--------------------------------------------------

       INSERT-SECTION-24.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 24" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 24"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 25
      *--------------------------------------------------

       INSERT-SECTION-25.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 25" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 25"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 26
      *--------------------------------------------------

       INSERT-SECTION-26.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 26" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 26"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 27
      *--------------------------------------------------

       INSERT-SECTION-27.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 27" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 27"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 28
      *--------------------------------------------------

       INSERT-SECTION-28.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 28" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 28"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 29
      *--------------------------------------------------

       INSERT-SECTION-29.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 29" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 29"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 30
      *--------------------------------------------------

       INSERT-SECTION-30.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 30" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 30"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 31
      *--------------------------------------------------

       INSERT-SECTION-31.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 31" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 31"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 32
      *--------------------------------------------------

       INSERT-SECTION-32.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 32" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 32"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 33
      *--------------------------------------------------

       INSERT-SECTION-33.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 33" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 33"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 34
      *--------------------------------------------------

       INSERT-SECTION-34.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 34" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 34"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 35
      *--------------------------------------------------

       INSERT-SECTION-35.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 35" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 35"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 36
      *--------------------------------------------------

       INSERT-SECTION-36.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 36" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 36"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 37
      *--------------------------------------------------

       INSERT-SECTION-37.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 37" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 37"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 38
      *--------------------------------------------------

       INSERT-SECTION-38.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 38" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 38"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 39
      *--------------------------------------------------

       INSERT-SECTION-39.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 39" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 39"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 40
      *--------------------------------------------------

       INSERT-SECTION-40.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 40" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 40"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 41
      *--------------------------------------------------

       INSERT-SECTION-41.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 41" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 41"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 42
      *--------------------------------------------------

       INSERT-SECTION-42.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 42" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 42"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 43
      *--------------------------------------------------

       INSERT-SECTION-43.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 43" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 43"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 44
      *--------------------------------------------------

       INSERT-SECTION-44.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 44" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 44"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 45
      *--------------------------------------------------

       INSERT-SECTION-45.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 45" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 45"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 46
      *--------------------------------------------------

       INSERT-SECTION-46.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 46" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 46"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 47
      *--------------------------------------------------

       INSERT-SECTION-47.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 47" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 47"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 48
      *--------------------------------------------------

       INSERT-SECTION-48.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 48" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 48"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 49
      *--------------------------------------------------

       INSERT-SECTION-49.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 49" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 49"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 50
      *--------------------------------------------------

       INSERT-SECTION-50.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 50" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 50"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 51
      *--------------------------------------------------

       INSERT-SECTION-51.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 51" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 51"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 52
      *--------------------------------------------------

       INSERT-SECTION-52.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 52" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 52"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 53
      *--------------------------------------------------

       INSERT-SECTION-53.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 53" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 53"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 54
      *--------------------------------------------------

       INSERT-SECTION-54.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 54" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 54"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 55
      *--------------------------------------------------

       INSERT-SECTION-55.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 55" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 55"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 56
      *--------------------------------------------------

       INSERT-SECTION-56.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 56" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 56"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 57
      *--------------------------------------------------

       INSERT-SECTION-57.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 57" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 57"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 58
      *--------------------------------------------------

       INSERT-SECTION-58.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 58" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 58"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 59
      *--------------------------------------------------

       INSERT-SECTION-59.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 59" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 59"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 60
      *--------------------------------------------------

       INSERT-SECTION-60.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 60" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 60"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 61
      *--------------------------------------------------

       INSERT-SECTION-61.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 61" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 61"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 62
      *--------------------------------------------------

       INSERT-SECTION-62.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 62" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 62"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 63
      *--------------------------------------------------

       INSERT-SECTION-63.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 63" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 63"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 64
      *--------------------------------------------------

       INSERT-SECTION-64.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 64" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 64"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 65
      *--------------------------------------------------

       INSERT-SECTION-65.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 65" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 65"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 66
      *--------------------------------------------------

       INSERT-SECTION-66.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 66" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 66"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 67
      *--------------------------------------------------

       INSERT-SECTION-67.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 67" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 67"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 68
      *--------------------------------------------------

       INSERT-SECTION-68.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 68" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 68"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 69
      *--------------------------------------------------

       INSERT-SECTION-69.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 69" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 69"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 70
      *--------------------------------------------------

       INSERT-SECTION-70.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 70" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 70"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 71
      *--------------------------------------------------

       INSERT-SECTION-71.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 71" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 71"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 72
      *--------------------------------------------------

       INSERT-SECTION-72.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 72" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 72"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 73
      *--------------------------------------------------

       INSERT-SECTION-73.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 73" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 73"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 74
      *--------------------------------------------------

       INSERT-SECTION-74.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 74" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 74"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 75
      *--------------------------------------------------

       INSERT-SECTION-75.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 75" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 75"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 76
      *--------------------------------------------------

       INSERT-SECTION-76.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 76" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 76"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 77
      *--------------------------------------------------

       INSERT-SECTION-77.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 77" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 77"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 78
      *--------------------------------------------------

       INSERT-SECTION-78.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 78" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 78"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 79
      *--------------------------------------------------

       INSERT-SECTION-79.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 79" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 79"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 80
      *--------------------------------------------------

       INSERT-SECTION-80.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 80" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 80"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 81
      *--------------------------------------------------

       INSERT-SECTION-81.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 81" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 81"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 82
      *--------------------------------------------------

       INSERT-SECTION-82.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 82" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 82"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 83
      *--------------------------------------------------

       INSERT-SECTION-83.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 83" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 83"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 84
      *--------------------------------------------------

       INSERT-SECTION-84.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 84" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 84"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 85
      *--------------------------------------------------

       INSERT-SECTION-85.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 85" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 85"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 86
      *--------------------------------------------------

       INSERT-SECTION-86.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 86" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 86"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 87
      *--------------------------------------------------

       INSERT-SECTION-87.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 87" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 87"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 88
      *--------------------------------------------------

       INSERT-SECTION-88.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 88" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 88"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 89
      *--------------------------------------------------

       INSERT-SECTION-89.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 89" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 89"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 90
      *--------------------------------------------------

       INSERT-SECTION-90.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 90" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 90"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 91
      *--------------------------------------------------

       INSERT-SECTION-91.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 91" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 91"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 92
      *--------------------------------------------------

       INSERT-SECTION-92.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 92" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 92"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 93
      *--------------------------------------------------

       INSERT-SECTION-93.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 93" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 93"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 94
      *--------------------------------------------------

       INSERT-SECTION-94.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 94" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 94"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 95
      *--------------------------------------------------

       INSERT-SECTION-95.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 95" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 95"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 96
      *--------------------------------------------------

       INSERT-SECTION-96.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 96" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 96"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 97
      *--------------------------------------------------

       INSERT-SECTION-97.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 97" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 97"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 98
      *--------------------------------------------------

       INSERT-SECTION-98.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 98" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 98"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 99
      *--------------------------------------------------

       INSERT-SECTION-99.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 99" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 99"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 100
      *--------------------------------------------------

       INSERT-SECTION-100.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 100" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 100"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 101
      *--------------------------------------------------

       INSERT-SECTION-101.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 101" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 101"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 102
      *--------------------------------------------------

       INSERT-SECTION-102.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 102" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 102"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 103
      *--------------------------------------------------

       INSERT-SECTION-103.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 103" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 103"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 104
      *--------------------------------------------------

       INSERT-SECTION-104.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 104" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 104"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 105
      *--------------------------------------------------

       INSERT-SECTION-105.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 105" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 105"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 106
      *--------------------------------------------------

       INSERT-SECTION-106.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 106" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 106"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 107
      *--------------------------------------------------

       INSERT-SECTION-107.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 107" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 107"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 108
      *--------------------------------------------------

       INSERT-SECTION-108.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 108" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 108"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 109
      *--------------------------------------------------

       INSERT-SECTION-109.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 109" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 109"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 110
      *--------------------------------------------------

       INSERT-SECTION-110.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 110" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 110"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 111
      *--------------------------------------------------

       INSERT-SECTION-111.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 111" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 111"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 112
      *--------------------------------------------------

       INSERT-SECTION-112.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 112" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 112"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 113
      *--------------------------------------------------

       INSERT-SECTION-113.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 113" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 113"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 114
      *--------------------------------------------------

       INSERT-SECTION-114.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 114" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 114"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 115
      *--------------------------------------------------

       INSERT-SECTION-115.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 115" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 115"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 116
      *--------------------------------------------------

       INSERT-SECTION-116.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 116" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 116"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 117
      *--------------------------------------------------

       INSERT-SECTION-117.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 117" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 117"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 118
      *--------------------------------------------------

       INSERT-SECTION-118.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 118" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 118"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * INSERT BLOQUE 119
      *--------------------------------------------------

       INSERT-SECTION-119.

           PERFORM VARYING WS-COUNT FROM 1 BY 1
              UNTIL WS-COUNT > WS-TOTAL

              MOVE WS-COUNT TO EMP-ID
              MOVE "STRESS USER 119" TO EMP-NAME
              MOVE 1000 TO EMP-SAL

              EXEC SQL
                 INSERT INTO TEST_EMP
                 (EMP_ID, EMP_NAME, SALARY)
                 VALUES (:EMP-ID, :EMP-NAME, :EMP-SAL)
              END-EXEC

              IF SQLCODE NOT = 0
                 DISPLAY "ERROR INSERT 119"
                 DISPLAY SQLCODE
              END-IF

              COMPUTE WS-MOD = FUNCTION MOD(WS-COUNT WS-BATCH-SIZE)

              IF WS-MOD = 0
                 EXEC SQL COMMIT END-EXEC
              END-IF

           END-PERFORM.
      *--------------------------------------------------
      * CURSOR MASIVO
      *--------------------------------------------------

       CURSOR-SECTION.

           EXEC SQL
              DECLARE C1 CURSOR FOR
              SELECT EMP_ID, EMP_NAME, SALARY
              FROM TEST_EMP
           END-EXEC.

           EXEC SQL OPEN C1 END-EXEC.

       FETCH-LOOP.

           EXEC SQL
              FETCH C1
              INTO :EMP-ID, :EMP-NAME, :EMP-SAL
           END-EXEC.

           IF SQLCODE = 0
              DISPLAY "LEIDO " EMP-ID
              GO TO FETCH-LOOP
           END-IF.

           EXEC SQL CLOSE C1 END-EXEC.
      *--------------------------------------------------
      * BLOQUE PLSQL EMBEBIDO
      *--------------------------------------------------

       PLSQL-SECTION.

           MOVE 1 TO EMP-ID

           EXEC SQL
           EXECUTE
           BEGIN
              FOR I IN 1..10000 LOOP
                 UPDATE TEST_EMP
                 SET SALARY = SALARY + 1
                 WHERE EMP_ID = :EMP-ID;
              END LOOP;
           END;
           END-EXEC.

           IF SQLCODE NOT = 0
              DISPLAY "ERROR PLSQL"
              DISPLAY SQLCODE
           END-IF.

           EXEC SQL COMMIT END-EXEC.