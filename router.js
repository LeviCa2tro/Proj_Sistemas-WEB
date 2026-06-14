const express = require('express');
const router  = express.Router();
const db      = require('./db');

const erro = (res, status, mensagem, detalhe) =>
  res.status(status).json({ erro: mensagem, detalhe: detalhe || null });

// ================================================================
//  PROFESSORES
// ================================================================
router.get('/professores', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM professor ORDER BY nome');
    res.json(rows);
  } catch (e) { erro(res, 500, 'Erro ao listar professores.', e.message); }
});

router.get('/professores/:matricula', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM professor WHERE matricula = ?', [req.params.matricula]);
    if (!rows.length) return erro(res, 404, 'Professor não encontrado.');
    res.json(rows[0]);
  } catch (e) { erro(res, 500, 'Erro ao buscar professor.', e.message); }
});

router.post('/professores', async (req, res) => {
  const { matricula, nome, email, telefone } = req.body;
  if (!matricula || !nome || !email)
    return erro(res, 400, 'Campos obrigatórios: matricula, nome, email.');
  try {
    await db.query('INSERT INTO professor (matricula, nome, email, telefone) VALUES (?, ?, ?, ?)',
      [matricula, nome, email, telefone || null]);
    res.status(201).json({ mensagem: 'Professor cadastrado com sucesso.', matricula });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return erro(res, 409, 'Matrícula ou e-mail já cadastrado.');
    erro(res, 500, 'Erro ao cadastrar professor.', e.message);
  }
});

router.put('/professores/:matricula', async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const campos = [], valores = [];
    if (nome)     { campos.push('nome = ?');     valores.push(nome); }
    if (email)    { campos.push('email = ?');    valores.push(email); }
    if (telefone !== undefined) { campos.push('telefone = ?'); valores.push(telefone); }
    if (!campos.length) return erro(res, 400, 'Informe ao menos um campo para atualizar.');
    valores.push(req.params.matricula);
    const [result] = await db.query(`UPDATE professor SET ${campos.join(', ')} WHERE matricula = ?`, valores);
    if (!result.affectedRows) return erro(res, 404, 'Professor não encontrado.');
    res.json({ mensagem: 'Professor atualizado com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao atualizar professor.', e.message); }
});

router.delete('/professores/:matricula', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM professor WHERE matricula = ?', [req.params.matricula]);
    if (!result.affectedRows) return erro(res, 404, 'Professor não encontrado.');
    res.json({ mensagem: 'Professor excluído com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao excluir professor.', e.message); }
});

// ================================================================
//  DISCIPLINAS
// ================================================================
router.get('/disciplinas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM disciplina ORDER BY nome_disciplina');
    res.json(rows);
  } catch (e) { erro(res, 500, 'Erro ao listar disciplinas.', e.message); }
});

router.get('/disciplinas/:codigo', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM disciplina WHERE codigo_disciplina = ?', [req.params.codigo]);
    if (!rows.length) return erro(res, 404, 'Disciplina não encontrada.');
    res.json(rows[0]);
  } catch (e) { erro(res, 500, 'Erro ao buscar disciplina.', e.message); }
});

router.post('/disciplinas', async (req, res) => {
  const { codigo_disciplina, nome_disciplina, carga_horaria } = req.body;
  if (!codigo_disciplina || !nome_disciplina || !carga_horaria)
    return erro(res, 400, 'Campos obrigatórios: codigo_disciplina, nome_disciplina, carga_horaria.');
  try {
    await db.query('INSERT INTO disciplina (codigo_disciplina, nome_disciplina, carga_horaria) VALUES (?, ?, ?)',
      [codigo_disciplina, nome_disciplina, carga_horaria]);
    res.status(201).json({ mensagem: 'Disciplina cadastrada com sucesso.', codigo_disciplina });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return erro(res, 409, 'Código de disciplina já cadastrado.');
    erro(res, 500, 'Erro ao cadastrar disciplina.', e.message);
  }
});

router.put('/disciplinas/:codigo', async (req, res) => {
  const { nome_disciplina, carga_horaria } = req.body;
  try {
    const campos = [], valores = [];
    if (nome_disciplina) { campos.push('nome_disciplina = ?'); valores.push(nome_disciplina); }
    if (carga_horaria !== undefined) { campos.push('carga_horaria = ?'); valores.push(carga_horaria); }
    if (!campos.length) return erro(res, 400, 'Informe ao menos um campo para atualizar.');
    valores.push(req.params.codigo);
    const [result] = await db.query(`UPDATE disciplina SET ${campos.join(', ')} WHERE codigo_disciplina = ?`, valores);
    if (!result.affectedRows) return erro(res, 404, 'Disciplina não encontrada.');
    res.json({ mensagem: 'Disciplina atualizada com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao atualizar disciplina.', e.message); }
});

router.delete('/disciplinas/:codigo', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM disciplina WHERE codigo_disciplina = ?', [req.params.codigo]);
    if (!result.affectedRows) return erro(res, 404, 'Disciplina não encontrada.');
    res.json({ mensagem: 'Disciplina excluída com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao excluir disciplina.', e.message); }
});

// ================================================================
//  APTIDÃO
// ================================================================
router.get('/professores/:matricula/aptidoes', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.codigo_disciplina, d.nome_disciplina, d.carga_horaria
       FROM professor_apto_disciplina pad
       JOIN disciplina d ON pad.codigo_disciplina = d.codigo_disciplina
       WHERE pad.matricula_professor = ?
       ORDER BY d.nome_disciplina`,
      [req.params.matricula]);
    res.json(rows);
  } catch (e) { erro(res, 500, 'Erro ao listar aptidões.', e.message); }
});

router.post('/professores/:matricula/aptidoes', async (req, res) => {
  const { codigo_disciplina } = req.body;
  if (!codigo_disciplina) return erro(res, 400, 'Campo obrigatório: codigo_disciplina.');
  try {
    await db.query('INSERT INTO professor_apto_disciplina (matricula_professor, codigo_disciplina) VALUES (?, ?)',
      [req.params.matricula, codigo_disciplina]);
    res.status(201).json({ mensagem: 'Aptidão registrada com sucesso.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return erro(res, 409, 'Aptidão já registrada.');
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return erro(res, 404, 'Professor ou disciplina não encontrado(a).');
    erro(res, 500, 'Erro ao registrar aptidão.', e.message);
  }
});

router.delete('/professores/:matricula/aptidoes/:codigo', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM professor_apto_disciplina WHERE matricula_professor = ? AND codigo_disciplina = ?',
      [req.params.matricula, req.params.codigo]);
    if (!result.affectedRows) return erro(res, 404, 'Aptidão não encontrada.');
    res.json({ mensagem: 'Aptidão removida com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao remover aptidão.', e.message); }
});

// ================================================================
//  TURMAS
// ================================================================
router.get('/turmas', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.codigo_turma, t.semestre, t.numero_alunos, t.horario,
              p.nome AS nome_professor, d.nome_disciplina
       FROM turma t
       JOIN professor p ON t.matricula_professor = p.matricula
       JOIN disciplina d ON t.codigo_disciplina = d.codigo_disciplina
       ORDER BY t.semestre DESC`);
    res.json(rows);
  } catch (e) { erro(res, 500, 'Erro ao listar turmas.', e.message); }
});

router.post('/turmas', async (req, res) => {
  const { codigo_turma, codigo_disciplina, matricula_professor, semestre, numero_alunos, horario } = req.body;
  if (!codigo_turma || !codigo_disciplina || !matricula_professor || !semestre || !numero_alunos || !horario)
    return erro(res, 400, 'Preencha todos os campos obrigatórios.');
  try {
    await db.query(
      `INSERT INTO turma (codigo_turma, codigo_disciplina, matricula_professor, semestre, numero_alunos, horario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo_turma, codigo_disciplina, matricula_professor, semestre, numero_alunos, horario]);
    res.status(201).json({ mensagem: 'Turma registrada com sucesso.', codigo_turma });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return erro(res, 409, 'Turma já registrada.');
    erro(res, 500, 'Erro ao registrar turma.', e.message);
  }
});

router.delete('/turmas/:codigo_turma', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM turma WHERE codigo_turma = ?', [req.params.codigo_turma]);
    if (!result.affectedRows) return erro(res, 404, 'Turma não encontrada.');
    res.json({ mensagem: 'Turma excluída com sucesso.' });
  } catch (e) { erro(res, 500, 'Erro ao excluir turma.', e.message); }
});

// ================================================================
//  CONSULTA — Professores aptos por disciplina
// ================================================================
router.get('/consultas/disciplina/:codigo/professores-aptos', async (req, res) => {
  try {
    const [disc] = await db.query('SELECT * FROM disciplina WHERE codigo_disciplina = ?', [req.params.codigo]);
    if (!disc.length) return erro(res, 404, 'Disciplina não encontrada.');
    const [professores] = await db.query(
      `SELECT p.matricula, p.nome, p.email, p.telefone
       FROM professor p
       JOIN professor_apto_disciplina pad ON p.matricula = pad.matricula_professor
       WHERE pad.codigo_disciplina = ?
       ORDER BY p.nome`,
      [req.params.codigo]);
    res.json({ disciplina: disc[0], total_professores_aptos: professores.length, professores });
  } catch (e) { erro(res, 500, 'Erro ao consultar professores aptos.', e.message); }
});

// ================================================================
//  CONSULTA — Histórico de disciplinas por professor
// ================================================================
router.get('/consultas/professor/:matricula/historico-disciplinas', async (req, res) => {
  try {
    const [prof] = await db.query('SELECT * FROM professor WHERE matricula = ?', [req.params.matricula]);
    if (!prof.length) return erro(res, 404, 'Professor não encontrado.');
    const [disciplinas] = await db.query(
      `SELECT d.codigo_disciplina, d.nome_disciplina,
              d.carga_horaria AS carga_horaria_por_turma,
              COUNT(t.codigo_turma) AS total_turmas,
              d.carga_horaria * COUNT(t.codigo_turma) AS carga_horaria_total,
              SUM(t.numero_alunos) AS total_alunos
       FROM turma t
       JOIN disciplina d ON t.codigo_disciplina = d.codigo_disciplina
       WHERE t.matricula_professor = ?
       GROUP BY d.codigo_disciplina, d.nome_disciplina, d.carga_horaria
       ORDER BY d.nome_disciplina`,
      [req.params.matricula]);
    const totais = disciplinas.reduce((acc, r) => ({
      turmas: acc.turmas + Number(r.total_turmas),
      carga:  acc.carga  + Number(r.carga_horaria_total),
      alunos: acc.alunos + Number(r.total_alunos),
    }), { turmas: 0, carga: 0, alunos: 0 });
    res.json({
      professor: prof[0],
      disciplinas,
      totais_gerais: {
        total_turmas: totais.turmas,
        carga_horaria_total: totais.carga,
        total_alunos: totais.alunos,
      },
    });
  } catch (e) { erro(res, 500, 'Erro ao consultar histórico.', e.message); }
});

module.exports = router;
