SELECT * FROM ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU ORDER BY 1 DESC;

SELECT * FROM ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU_RETORNO ORDER BY 1 DESC;

--DELETE FROM ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU;
--DELETE FROM ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU_RETORNO;

CREATE TABLE ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU_RETORNO (
    id INT IDENTITY(1,1) PRIMARY KEY, -- ID com chave primária
    codigo_canal_operacao NVARCHAR(200),
    codigo_operador NVARCHAR(200),
    etapa_processo_boleto NVARCHAR(200),
    beneficiario_id_beneficiario NVARCHAR(200),
    beneficiario_nome_cobranca NVARCHAR(200),
    beneficiario_tipo_pessoa_codigo_tipo_pessoa NVARCHAR(200),
    beneficiario_tipo_pessoa_numero_cadastro_nacional_pessoa_juridica NVARCHAR(200),
    beneficiario_endereco_nome_logradouro NVARCHAR(200),
    beneficiario_endereco_nome_bairro NVARCHAR(200),
    beneficiario_endereco_nome_cidade NVARCHAR(200),
    beneficiario_endereco_sigla_UF NVARCHAR(200),
    beneficiario_endereco_numero_CEP NVARCHAR(200),
    beneficiario_endereco_numero NVARCHAR(200),
    beneficiario_endereco_complemento NVARCHAR(200),
    dado_boleto_descricao_instrumento_cobranca NVARCHAR(200),
    dado_boleto_tipo_boleto NVARCHAR(200),
    dado_boleto_pagador_pessoa_nome_pessoa NVARCHAR(200),
    dado_boleto_pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa NVARCHAR(200),
    dado_boleto_pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica NVARCHAR(200),
    dado_boleto_pagador_endereco_nome_logradouro NVARCHAR(200),
    dado_boleto_pagador_endereco_nome_bairro NVARCHAR(200),
    dado_boleto_pagador_endereco_nome_cidade NVARCHAR(200),
    dado_boleto_pagador_endereco_sigla_UF NVARCHAR(200),
    dado_boleto_pagador_endereco_numero_CEP NVARCHAR(200),
    dado_boleto_codigo_carteira NVARCHAR(200),
    dado_boleto_codigo_tipo_vencimento NVARCHAR(200),
    dado_boleto_valor_total_titulo NVARCHAR(200),
    dados_individuais_boleto_numero_nosso_numero NVARCHAR(200),
    dados_individuais_boleto_dac_titulo NVARCHAR(200),
    dados_individuais_boleto_data_vencimento NVARCHAR(200),
    dados_individuais_boleto_valor_titulo NVARCHAR(200),
    dados_individuais_boleto_texto_seu_numero NVARCHAR(200),
    dados_individuais_boleto_codigo_barras NVARCHAR(200),
    dados_individuais_boleto_numero_linha_digitavel NVARCHAR(200),
    dados_individuais_boleto_data_limite_pagamento NVARCHAR(200),
    dados_qrcode_chave NVARCHAR(200),
    dados_qrcode_txid NVARCHAR(200),
    dados_qrcode_id_location NVARCHAR(200),
    dados_qrcode_location NVARCHAR(200),
    dados_qrcode_emv NVARCHAR(200),
    dados_qrcode_base64 NVARCHAR(MAX), -- Base64 pode ser maior
    tp_status NVARCHAR(200), -- Coluna de status
    id_envio_fk INT, -- Campo para referência a outra tabela
    sn_erro NVARCHAR(200), -- Campo para indicar erro
    descricao_erro NVARCHAR(500), -- Campo para descrição do erro
	json_completo NVARCHAR(MAX), -- Coluna para armazenar todo o JSON
    data_hora_criacao DATETIME DEFAULT GETDATE(), -- Data e hora de criação
    data_hora_alteracao DATETIME DEFAULT GETDATE() -- Data e hora de alteração
);
