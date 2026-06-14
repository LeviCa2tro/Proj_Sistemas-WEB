-- ============================================================
--  BANCO DE DADOS - DEPARTAMENTOS DE ENSINO UNIVERSITARIO
-- ============================================================
 
CREATE DATABASE IF NOT EXISTS universidade
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
 
USE universidade;
 
-- ------------------------------------------------------------
-- a) Professores do departamento
-- ------------------------------------------------------------
CREATE TABLE professor (
    matricula      VARCHAR(20)  NOT NULL,
    nome           VARCHAR(120) NOT NULL,
    email          VARCHAR(120) NOT NULL,
    telefone       VARCHAR(20),
    CONSTRAINT pk_professor PRIMARY KEY (matricula),
    CONSTRAINT uq_professor_email UNIQUE (email)
);
 
-- ------------------------------------------------------------
-- b) Disciplinas ministradas no departamento
-- ------------------------------------------------------------
CREATE TABLE disciplina (
    codigo_disciplina VARCHAR(20)       NOT NULL,
    nome_disciplina   VARCHAR(150)      NOT NULL,
    carga_horaria     SMALLINT UNSIGNED NOT NULL COMMENT 'Em horas',
    CONSTRAINT pk_disciplina PRIMARY KEY (codigo_disciplina)
);
 
-- ------------------------------------------------------------
-- c) Aptidao: quais disciplinas um professor pode ministrar
-- ------------------------------------------------------------
CREATE TABLE professor_apto_disciplina (
    matricula_professor VARCHAR(20) NOT NULL,
    codigo_disciplina   VARCHAR(20) NOT NULL,
    CONSTRAINT pk_apto PRIMARY KEY (matricula_professor, codigo_disciplina),
    CONSTRAINT fk_apto_professor
        FOREIGN KEY (matricula_professor) REFERENCES professor(matricula)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_apto_disciplina
        FOREIGN KEY (codigo_disciplina) REFERENCES disciplina(codigo_disciplina)
        ON DELETE CASCADE ON UPDATE CASCADE
);
 
-- ------------------------------------------------------------
-- d) Turmas ministradas pelo professor
-- ------------------------------------------------------------
CREATE TABLE turma (
    codigo_turma        VARCHAR(20)                   NOT NULL,
    codigo_disciplina   VARCHAR(20)                   NOT NULL,
    matricula_professor VARCHAR(20)                   NOT NULL,
    semestre            VARCHAR(10)                   NOT NULL COMMENT 'Ex.: 2024.1, 2024.2',
    numero_alunos       SMALLINT UNSIGNED             NOT NULL,
    horario             ENUM('Manha','Tarde','Noite') NOT NULL,
    CONSTRAINT pk_turma PRIMARY KEY (codigo_turma, codigo_disciplina, matricula_professor, semestre),
    CONSTRAINT fk_turma_disciplina
        FOREIGN KEY (codigo_disciplina)   REFERENCES disciplina(codigo_disciplina)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_turma_professor
        FOREIGN KEY (matricula_professor) REFERENCES professor(matricula)
        ON DELETE RESTRICT ON UPDATE CASCADE
);
 
-- ============================================================
--  DADOS DE EXEMPLO
-- ============================================================
 
-- Professores
INSERT INTO professor (matricula, nome, email, telefone) VALUES
('P001', 'Ana Beatriz Souza',  'ana.souza@univ.br',   '(85) 99100-0001'),
('P002', 'Carlos Lima',        'carlos.lima@univ.br', '(85) 99100-0002'),
('P003', 'Fernanda Oliveira',  'fernanda.ol@univ.br', '(85) 99100-0003');
 
-- Disciplinas
INSERT INTO disciplina (codigo_disciplina, nome_disciplina, carga_horaria) VALUES
('MAT101', 'Calculo I',                  60),
('MAT102', 'Algebra Linear',             60),
('INF201', 'Estruturas de Dados',        80),
('INF202', 'Banco de Dados',             60),
('FIS101', 'Fisica para Engenharia I',   60);
 
-- Aptidoes
INSERT INTO professor_apto_disciplina (matricula_professor, codigo_disciplina) VALUES
('P001', 'MAT101'),
('P001', 'MAT102'),
('P002', 'INF201'),
('P002', 'INF202'),
('P003', 'MAT101'),
('P003', 'FIS101');
 
-- Turmas
INSERT INTO turma (codigo_turma, codigo_disciplina, matricula_professor, semestre, numero_alunos, horario) VALUES
('T001', 'MAT101', 'P001', '2023.2', 42, 'Manha'),
('T002', 'MAT102', 'P001', '2024.1', 38, 'Tarde'),
('T003', 'INF201', 'P002', '2023.2', 35, 'Noite'),
('T004', 'INF202', 'P002', '2024.1', 30, 'Tarde'),
('T005', 'FIS101', 'P003', '2024.1', 50, 'Manha'),
('T006', 'MAT101', 'P003', '2023.1', 45, 'Noite');
 
-- ============================================================
--  CONSULTAS UTEIS
-- ============================================================
 
-- 1. Disciplinas que um professor e apto a ministrar
-- SELECT p.nome, d.nome_disciplina, d.carga_horaria
-- FROM professor p
-- JOIN professor_apto_disciplina pad ON p.matricula = pad.matricula_professor
-- JOIN disciplina d ON pad.codigo_disciplina = d.codigo_disciplina
-- WHERE p.matricula = 'P001';
 
-- 2. Historico completo de turmas de um professor
-- SELECT p.nome, t.codigo_turma, d.nome_disciplina,
--        t.semestre, t.numero_alunos, t.horario
-- FROM turma t
-- JOIN professor p ON t.matricula_professor = p.matricula
-- JOIN disciplina d ON t.codigo_disciplina  = d.codigo_disciplina
-- WHERE t.matricula_professor = 'P002'
-- ORDER BY t.semestre;
 
-- 3. Professores aptos para uma disciplina especifica
-- SELECT p.matricula, p.nome, p.email
-- FROM professor p
-- JOIN professor_apto_disciplina pad ON p.matricula = pad.matricula_professor
-- WHERE pad.codigo_disciplina = 'MAT101';
 
-- 4. Turmas por horario em um semestre
-- SELECT horario, COUNT(*) AS total_turmas, SUM(numero_alunos) AS total_alunos
-- FROM turma
-- WHERE semestre = '2024.1'
-- GROUP BY horario;
