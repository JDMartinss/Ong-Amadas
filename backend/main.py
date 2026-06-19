import os
import uuid
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import or_

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

app = Flask(__name__)

# quando for colocar em produção, precisa trocar essa chave
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao")

# o banco de dados fica num arquivo .db local (SQLite)
# é tipo um Excel gigante mas que o Python consegue acessar via código
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL",
    "sqlite:///amadas.db",
)

# limite de upload: 8 MB por imagem, pra evitar mandar arquivo gigante sem querer
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# isso aqui só evita um aviso chato no terminal, pode deixar False mesmo
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# em produção troca o localhost pelo domínio real do site
CORS(app, origins=os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173"))

db = SQLAlchemy(app)


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    inscricoes = db.relationship("InscricaoEvento", back_populates="usuario", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }


class ImagemCarrossel(db.Model):
    __tablename__ = "imagens_carrossel"

    id = db.Column(db.Integer, primary_key=True)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    texto_alt = db.Column(db.String(180), nullable=False, default="Imagem da ONG Amadas")
    ordem = db.Column(db.Integer, nullable=False, default=0)
    ativa = db.Column(db.Boolean, nullable=False, default=True)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "url": f"/uploads/{self.nome_arquivo}",
            "alt": self.texto_alt,
            "ordem": self.ordem,
            "ativa": self.ativa,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }


class Evento(db.Model):
    __tablename__ = "eventos"

    id_evento = db.Column(db.Integer, primary_key=True)
    nome_evento = db.Column(db.String(120), nullable=False)
    data = db.Column(db.String(20), nullable=False)
    local = db.Column(db.String(160), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    inscricoes = db.relationship("InscricaoEvento", back_populates="evento", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id_evento": self.id_evento,
            "nome_evento": self.nome_evento,
            "data": self.data,
            "local": self.local,
            "descricao": self.descricao,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }


class InscricaoEvento(db.Model):
    __tablename__ = "inscricoes_eventos"

    id_inscricao = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    evento_id = db.Column(db.Integer, db.ForeignKey("eventos.id_evento"), nullable=False)
    data_inscricao = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    usuario = db.relationship("Usuario", back_populates="inscricoes")
    evento = db.relationship("Evento", back_populates="inscricoes")

    __table_args__ = (
        db.UniqueConstraint("usuario_id", "evento_id", name="uq_usuario_evento"),
    )

    def to_dict(self):
        return {
            "id_inscricao": self.id_inscricao,
            "usuario_id": self.usuario_id,
            "usuario_nome": self.usuario.nome if self.usuario else "-",
            "usuario_email": self.usuario.email if self.usuario else "-",
            "evento_id": self.evento_id,
            "nome_evento": self.evento.nome_evento if self.evento else "-",
            "data_evento": self.evento.data if self.evento else "-",
            "local_evento": self.evento.local if self.evento else "-",
            "data_inscricao": self.data_inscricao.isoformat() if self.data_inscricao else None,
        }


def extensao_permitida(nome_arquivo):
    return "." in nome_arquivo and nome_arquivo.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def montar_url_completa(path):
    return request.host_url.rstrip("/") + path


@app.route("/")
def index():
    return jsonify({"status": "API ONG Amadas funcionando!"})


# rota de cadastro — recebe POST com nome, email e senha em JSON
@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.get_json(silent=True) or {}

    # .strip() remove espaços antes e depois (ex: "  admin@gmail.com  " vira "admin@gmail.com")
    # o "or ''" é pra não quebrar se o campo vier None
    nome = (dados.get("nome") or "").strip()
    email = (dados.get("email") or "").strip().lower()
    senha = (dados.get("senha") or "").strip()

    # validações básicas antes de tentar salvar qualquer coisa
    if not nome or not email or not senha:
        return jsonify({"ok": False, "msg": "Preencha todos os campos."}), 400

    if len(senha) < 6:
        return jsonify({"ok": False, "msg": "A senha deve ter ao menos 6 caracteres."}), 400

    # verifica se já existe um usuário com esse email no banco
    if Usuario.query.filter_by(email=email).first():
        return jsonify({"ok": False, "msg": "E-mail já cadastrado."}), 409

    # gera o hash da senha — NUNCA salvo a senha original, só o hash
    # é tipo um código embaralhado que não tem como desfazer
    novo = Usuario(
        nome=nome,
        email=email,
        senha=generate_password_hash(senha),
    )
    db.session.add(novo)
    db.session.commit()

    return jsonify({"ok": True, "msg": "Cadastro realizado!", "usuario": novo.to_dict()}), 201


# rota de login — verifica email e senha
@app.route("/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True) or {}

    email = (dados.get("email") or "").strip().lower()
    senha = (dados.get("senha") or "").strip()

    if not email or not senha:
        return jsonify({"ok": False, "msg": "Preencha e-mail e senha."}), 400

    # busca o usuário pelo email
    usuario = Usuario.query.filter_by(email=email).first()

    # check_password_hash compara a senha digitada com o hash guardado no banco
    # se o usuário não existir OU a senha não bater, cai aqui
    # devolvo a mesma mensagem pra não vazar se o email existe ou não (segurança básica)
    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({"ok": False, "msg": "E-mail ou senha incorretos."}), 401

    return jsonify({"ok": True, "msg": "Login realizado!", "usuario": usuario.to_dict()})


@app.route("/uploads/<path:nome_arquivo>")
def arquivo_upload(nome_arquivo):
    return send_from_directory(app.config["UPLOAD_FOLDER"], nome_arquivo)


@app.route("/carrossel", methods=["GET"])
def listar_carrossel():
    imagens = (
        ImagemCarrossel.query
        .filter_by(ativa=True)
        .order_by(ImagemCarrossel.ordem.asc(), ImagemCarrossel.id.asc())
        .all()
    )

    dados = []
    for imagem in imagens:
        item = imagem.to_dict()
        item["url"] = montar_url_completa(item["url"])
        dados.append(item)

    return jsonify({"ok": True, "imagens": dados})


@app.route("/admin/carrossel", methods=["GET"])
def listar_carrossel_admin():
    imagens = ImagemCarrossel.query.order_by(ImagemCarrossel.ordem.asc(), ImagemCarrossel.id.asc()).all()

    dados = []
    for imagem in imagens:
        item = imagem.to_dict()
        item["url"] = montar_url_completa(item["url"])
        dados.append(item)

    return jsonify({"ok": True, "imagens": dados})


@app.route("/admin/carrossel", methods=["POST"])
def adicionar_imagem_carrossel():
    if "imagem" not in request.files:
        return jsonify({"ok": False, "msg": "Envie uma imagem."}), 400

    arquivo = request.files["imagem"]
    texto_alt = (request.form.get("alt") or "Imagem da ONG Amadas").strip()

    if arquivo.filename == "":
        return jsonify({"ok": False, "msg": "Escolha um arquivo de imagem."}), 400

    if not extensao_permitida(arquivo.filename):
        return jsonify({"ok": False, "msg": "Formato inválido. Use PNG, JPG, JPEG, GIF ou WEBP."}), 400

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    nome_seguro = secure_filename(arquivo.filename)
    extensao = nome_seguro.rsplit(".", 1)[1].lower()
    nome_final = f"{uuid.uuid4().hex}.{extensao}"
    caminho = os.path.join(app.config["UPLOAD_FOLDER"], nome_final)
    arquivo.save(caminho)

    ultima_ordem = db.session.query(db.func.max(ImagemCarrossel.ordem)).scalar()
    nova_imagem = ImagemCarrossel(
        nome_arquivo=nome_final,
        texto_alt=texto_alt[:180],
        ordem=(ultima_ordem or 0) + 1,
        ativa=True,
    )
    db.session.add(nova_imagem)
    db.session.commit()

    item = nova_imagem.to_dict()
    item["url"] = montar_url_completa(item["url"])
    return jsonify({"ok": True, "msg": "Imagem adicionada ao carrossel!", "imagem": item}), 201


@app.route("/admin/carrossel/<int:imagem_id>", methods=["PUT"])
def editar_imagem_carrossel(imagem_id):
    imagem = ImagemCarrossel.query.get_or_404(imagem_id)
    dados = request.get_json(silent=True) or {}

    if "alt" in dados:
        imagem.texto_alt = (dados.get("alt") or "Imagem da ONG Amadas").strip()[:180]
    if "ordem" in dados:
        try:
            imagem.ordem = int(dados.get("ordem"))
        except (TypeError, ValueError):
            return jsonify({"ok": False, "msg": "A ordem precisa ser um número."}), 400
    if "ativa" in dados:
        imagem.ativa = bool(dados.get("ativa"))

    db.session.commit()
    item = imagem.to_dict()
    item["url"] = montar_url_completa(item["url"])
    return jsonify({"ok": True, "msg": "Imagem atualizada!", "imagem": item})


@app.route("/admin/carrossel/<int:imagem_id>", methods=["DELETE"])
def remover_imagem_carrossel(imagem_id):
    imagem = ImagemCarrossel.query.get_or_404(imagem_id)
    caminho = os.path.join(app.config["UPLOAD_FOLDER"], imagem.nome_arquivo)

    db.session.delete(imagem)
    db.session.commit()

    # remove também o arquivo físico da pasta uploads, mas sem quebrar se ele já não existir
    try:
        if os.path.exists(caminho):
            os.remove(caminho)
    except OSError:
        pass

    return jsonify({"ok": True, "msg": "Imagem removida do carrossel."})


@app.route("/admin/dados", methods=["GET"])
def listar_dados_admin():
    """Retorna usuários, imagens, eventos e inscrições para o painel administrativo."""
    filtro_usuario = (request.args.get("usuario") or "").strip().lower()
    filtro_evento = (request.args.get("evento") or "").strip().lower()

    usuarios_query = Usuario.query
    if filtro_usuario:
        like = f"%{filtro_usuario}%"
        usuarios_query = usuarios_query.filter(
            or_(Usuario.nome.ilike(like), Usuario.email.ilike(like))
        )

    eventos_query = Evento.query
    if filtro_evento:
        like = f"%{filtro_evento}%"
        eventos_query = eventos_query.filter(
            or_(
                Evento.nome_evento.ilike(like),
                Evento.local.ilike(like),
                Evento.descricao.ilike(like),
                Evento.data.ilike(like),
            )
        )

    inscricoes_query = InscricaoEvento.query.join(Usuario).join(Evento)
    if filtro_usuario:
        like = f"%{filtro_usuario}%"
        inscricoes_query = inscricoes_query.filter(
            or_(Usuario.nome.ilike(like), Usuario.email.ilike(like))
        )
    if filtro_evento:
        like = f"%{filtro_evento}%"
        inscricoes_query = inscricoes_query.filter(
            or_(
                Evento.nome_evento.ilike(like),
                Evento.local.ilike(like),
                Evento.descricao.ilike(like),
                Evento.data.ilike(like),
            )
        )

    usuarios = usuarios_query.order_by(Usuario.id.desc()).all()
    imagens = ImagemCarrossel.query.order_by(ImagemCarrossel.ordem.asc(), ImagemCarrossel.id.asc()).all()
    eventos = eventos_query.order_by(Evento.id_evento.desc()).all()
    inscricoes = inscricoes_query.order_by(InscricaoEvento.id_inscricao.desc()).all()

    imagens_formatadas = []
    for imagem in imagens:
        item = imagem.to_dict()
        item["url"] = montar_url_completa(item["url"])
        imagens_formatadas.append(item)

    total_usuarios = Usuario.query.count()
    total_imagens = ImagemCarrossel.query.count()
    total_eventos = Evento.query.count()
    total_inscricoes = InscricaoEvento.query.count()

    return jsonify({
        "ok": True,
        "usuarios": [usuario.to_dict() for usuario in usuarios],
        "imagens": imagens_formatadas,
        "eventos": [evento.to_dict() for evento in eventos],
        "inscricoes": [inscricao.to_dict() for inscricao in inscricoes],
        "totais": {
            "usuarios": total_usuarios,
            "imagens": total_imagens,
            "eventos": total_eventos,
            "inscricoes": total_inscricoes,
        }
    })


@app.route("/admin/eventos", methods=["POST"])
def adicionar_evento():
    dados = request.get_json(silent=True) or {}
    nome_evento = (dados.get("nome_evento") or "").strip()
    data = (dados.get("data") or "").strip()
    local = (dados.get("local") or "").strip()
    descricao = (dados.get("descricao") or "").strip()

    if not nome_evento or not data or not local or not descricao:
        return jsonify({"ok": False, "msg": "Preencha nome, data, local e descrição do evento."}), 400

    novo = Evento(
        nome_evento=nome_evento,
        data=data,
        local=local,
        descricao=descricao,
    )
    db.session.add(novo)
    db.session.commit()

    return jsonify({"ok": True, "msg": "Evento cadastrado com sucesso!", "evento": novo.to_dict()}), 201


@app.route("/admin/inscricoes", methods=["POST"])
def adicionar_inscricao_evento():
    dados = request.get_json(silent=True) or {}

    try:
        usuario_id = int(dados.get("usuario_id"))
        evento_id = int(dados.get("evento_id"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "msg": "Selecione um usuário e um evento válidos."}), 400

    usuario = Usuario.query.get(usuario_id)
    evento = Evento.query.get(evento_id)

    if not usuario or not evento:
        return jsonify({"ok": False, "msg": "Usuário ou evento não encontrado."}), 404

    ja_existe = InscricaoEvento.query.filter_by(usuario_id=usuario_id, evento_id=evento_id).first()
    if ja_existe:
        return jsonify({"ok": False, "msg": "Este usuário já está inscrito nesse evento."}), 409

    nova = InscricaoEvento(usuario_id=usuario_id, evento_id=evento_id)
    db.session.add(nova)
    db.session.commit()

    return jsonify({"ok": True, "msg": "Inscrição cadastrada com sucesso!", "inscricao": nova.to_dict()}), 201


@app.route("/admin/inscricoes/<int:id_inscricao>", methods=["DELETE"])
def remover_inscricao_evento(id_inscricao):
    inscricao = InscricaoEvento.query.get_or_404(id_inscricao)
    db.session.delete(inscricao)
    db.session.commit()
    return jsonify({"ok": True, "msg": "Inscrição removida."})


@app.route("/admin/eventos/<int:id_evento>", methods=["DELETE"])
def remover_evento(id_evento):
    evento = Evento.query.get_or_404(id_evento)
    InscricaoEvento.query.filter_by(evento_id=id_evento).delete()
    db.session.delete(evento)
    db.session.commit()
    return jsonify({"ok": True, "msg": "Evento removido."})


if __name__ == "__main__":
    # cria as tabelas no banco se ainda não existirem (tipo uma migração automática)
    with app.app_context():
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        db.create_all()
        print("Banco de dados pronto.")

    # debug=True recarrega o servidor sozinho quando salvo o arquivo — muito útil pra dev
    # MEXER AQUI TAMBEM QUANDO FOR PARA PRODUÇÃO
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true", port=5000)
