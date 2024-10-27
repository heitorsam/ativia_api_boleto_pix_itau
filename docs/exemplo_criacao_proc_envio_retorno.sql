SELECT * FROM ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU ORDER BY 1 DESC;

-- Chamando a procedure com os dados simulados
EXEC USP_ADICIONAR_BOLETO_ITAU_RETORNO 
  @codigo_canal_operacao = 'Canal X',
  @codigo_operador = 'Operador Y',
  @etapa_processo_boleto = 'Etapa X',
  @beneficiario_id_beneficiario = '12345',
  @beneficiario_nome_cobranca = 'Nome do Beneficiário',
  @beneficiario_tipo_pessoa_codigo_tipo_pessoa = '01',
  @beneficiario_tipo_pessoa_numero_cadastro_nacional_pessoa_juridica = '12345678901',
  @beneficiario_endereco_nome_logradouro = 'Rua Exemplo',
  @beneficiario_endereco_nome_bairro = 'Bairro Exemplo',
  @beneficiario_endereco_nome_cidade = 'Cidade Exemplo',
  @beneficiario_endereco_sigla_UF = 'SP',
  @beneficiario_endereco_numero_CEP = '12345-678',
  @beneficiario_endereco_numero = '123',
  @beneficiario_endereco_complemento = 'Apto 101',
  @dado_boleto_descricao_instrumento_cobranca = 'Cobrança X',
  @dado_boleto_tipo_boleto = 'Tipo X',
  @dado_boleto_pagador_pessoa_nome_pessoa = 'Nome do Pagador',
  @dado_boleto_pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa = '01',
  @dado_boleto_pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica = '12345678901',
  @dado_boleto_pagador_endereco_nome_logradouro = 'Rua Exemplo',
  @dado_boleto_pagador_endereco_nome_bairro = 'Bairro Exemplo',
  @dado_boleto_pagador_endereco_nome_cidade = 'Cidade Exemplo',
  @dado_boleto_pagador_endereco_sigla_UF = 'SP',
  @dado_boleto_pagador_endereco_numero_CEP = '12345-678',
  @dado_boleto_codigo_carteira = 'Carteira Y',
  @dado_boleto_codigo_tipo_vencimento = '01',
  @dado_boleto_valor_total_titulo = '265.59',
  @dados_individuais_boleto_numero_nosso_numero = '0000000',
  @dados_individuais_boleto_dac_titulo = NULL, -- Valor não informado
  @dados_individuais_boleto_data_vencimento = '2024-12-01',
  @dados_individuais_boleto_valor_titulo = '265.59',
  @dados_individuais_boleto_texto_seu_numero = '000123',
  @dados_individuais_boleto_codigo_barras = NULL, -- Valor não informado
  @dados_individuais_boleto_numero_linha_digitavel = NULL, -- Valor não informado
  @dados_individuais_boleto_data_limite_pagamento = NULL, -- Valor não informado
  @dados_qrcode_chave = 'Chave PIX',
  @dados_qrcode_txid = 'TX123',
  @dados_qrcode_id_location = '123456',
  @dados_qrcode_location = 'Location X',
  @dados_qrcode_emv = 'Emv X',
  @dados_qrcode_base64 = 'Base64QRCode',
  @sn_erro = NULL, -- Inicialmente sem erro
  @descricao_erro = NULL, -- Sem descrição de erro
	  @json_completo = 'json'; -- JSON completo