ALTER PROCEDURE USP_STG_GERA_BOLETO_ITAU
	@ID_PK BIGINT,
    @etapa_processo_boleto NVARCHAR(200),
    @beneficiario_id_beneficiario NVARCHAR(200),
    @dado_boleto_tipo_boleto NVARCHAR(200),
    @dado_boleto_descricao_instrumento_cobranca NVARCHAR(200),
    @dado_boleto_texto_seu_numero NVARCHAR(200),
    @dado_boleto_codigo_carteira NVARCHAR(200),
    @dado_boleto_valor_total_titulo NVARCHAR(200),
    @dado_boleto_codigo_especie NVARCHAR(200),
    @dado_boleto_data_emissao NVARCHAR(200),
    @dado_boleto_valor_abatimento NVARCHAR(200),
    @negativacao_negativacao NVARCHAR(200),
    @negativacao_quantidade_dias_negativacao NVARCHAR(200),
    @pagador_pessoa_nome_pessoa NVARCHAR(200),
    @pagador_pessoa_nome_fantasia NVARCHAR(200),
    @pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa NVARCHAR(200),
    @pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica NVARCHAR(200),
    @pagador_endereco_nome_logradouro NVARCHAR(200),
    @pagador_endereco_nome_bairro NVARCHAR(200),
    @pagador_endereco_nome_cidade NVARCHAR(200),
    @pagador_endereco_sigla_UF NVARCHAR(200),
    @pagador_endereco_numero_CEP NVARCHAR(200),
    @sacador_avalista_pessoa_nome_pessoa NVARCHAR(200),
    @sacador_avalista_pessoa_tipo_pessoa_codigo_tipo_pessoa NVARCHAR(200),
    @sacador_avalista_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica NVARCHAR(200),
    @sacador_avalista_endereco_nome_logradouro NVARCHAR(200),
    @sacador_avalista_endereco_nome_bairro NVARCHAR(200),
    @sacador_avalista_endereco_nome_cidade NVARCHAR(200),
    @sacador_avalista_endereco_sigla_UF NVARCHAR(200),
    @sacador_avalista_endereco_numero_CEP NVARCHAR(200),
    @dados_individuais_boleto_numero_nosso_numero NVARCHAR(200),
    @dados_individuais_boleto_data_vencimento NVARCHAR(200),
    @dados_individuais_boleto_texto_uso_beneficiario NVARCHAR(200),
    @dados_individuais_boleto_valor_titulo NVARCHAR(200),
    @dados_individuais_boleto_data_limite_pagamento NVARCHAR(200),
    @juros_data_juros NVARCHAR(200),
    @juros_codigo_tipo_juros NVARCHAR(200),
    @juros_valor_juros NVARCHAR(200),
    @multa_codigo_tipo_multa NVARCHAR(200),
    @multa_percentual_multa NVARCHAR(200),
    @multa_data_multa NVARCHAR(200),
    @descontos_codigo_tipo_desconto NVARCHAR(200),
    @descontos_data_desconto NVARCHAR(200),
    @descontos_valor_desconto NVARCHAR(200),
    @descontos_percentual_desconto NVARCHAR(200),
    @dados_qrcode_chave NVARCHAR(200),
    @dados_qrcode_id_location NVARCHAR(200),
    @TP_STATUS NVARCHAR(200),
    @json_completo NVARCHAR(MAX),
    @Acao NVARCHAR(1) -- 'A' para adicionar e 'U' para update de status
AS
BEGIN
    DECLARE @ID_RET INT
    DECLARE @DS_RET NVARCHAR(200)
    DECLARE @ID INT

    BEGIN TRY
        IF @Acao = 'A' 
        BEGIN
            -- Inserção de dados
            INSERT INTO ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU (
                etapa_processo_boleto,
                beneficiario_id_beneficiario,
                dado_boleto_tipo_boleto,
                dado_boleto_descricao_instrumento_cobranca,
                dado_boleto_texto_seu_numero,
                dado_boleto_codigo_carteira,
                dado_boleto_valor_total_titulo,
                dado_boleto_codigo_especie,
                dado_boleto_data_emissao,
                dado_boleto_valor_abatimento,
                negativacao_negativacao,
                negativacao_quantidade_dias_negativacao,
                pagador_pessoa_nome_pessoa,
                pagador_pessoa_nome_fantasia,
                pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa,
                pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica,
                pagador_endereco_nome_logradouro,
                pagador_endereco_nome_bairro,
                pagador_endereco_nome_cidade,
                pagador_endereco_sigla_UF,
                pagador_endereco_numero_CEP,
                sacador_avalista_pessoa_nome_pessoa,
                sacador_avalista_pessoa_tipo_pessoa_codigo_tipo_pessoa,
                sacador_avalista_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica,
                sacador_avalista_endereco_nome_logradouro,
                sacador_avalista_endereco_nome_bairro,
                sacador_avalista_endereco_nome_cidade,
                sacador_avalista_endereco_sigla_UF,
                sacador_avalista_endereco_numero_CEP,
                dados_individuais_boleto_numero_nosso_numero,
                dados_individuais_boleto_data_vencimento,
                dados_individuais_boleto_texto_uso_beneficiario,
                dados_individuais_boleto_valor_titulo,
                dados_individuais_boleto_data_limite_pagamento,
                juros_data_juros,
                juros_codigo_tipo_juros,
                juros_valor_juros,
                multa_codigo_tipo_multa,
                multa_percentual_multa,
                multa_data_multa,
                descontos_codigo_tipo_desconto,
                descontos_data_desconto,
                descontos_valor_desconto,
                descontos_percentual_desconto,
                dados_qrcode_chave,
                dados_qrcode_id_location,
                TP_STATUS,
                json_completo,
                data_hora_criacao
            ) VALUES (
                @etapa_processo_boleto,
				CAST(CAST(@beneficiario_id_beneficiario AS FLOAT) AS BIGINT),
                @dado_boleto_tipo_boleto,
                @dado_boleto_descricao_instrumento_cobranca,
                @dado_boleto_texto_seu_numero,
                @dado_boleto_codigo_carteira,
                @dado_boleto_valor_total_titulo,
                @dado_boleto_codigo_especie,
                @dado_boleto_data_emissao,
                @dado_boleto_valor_abatimento,
                @negativacao_negativacao,
                @negativacao_quantidade_dias_negativacao,
                @pagador_pessoa_nome_pessoa,
                @pagador_pessoa_nome_fantasia,
                @pagador_pessoa_tipo_pessoa_codigo_tipo_pessoa,
                @pagador_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica,
                @pagador_endereco_nome_logradouro,
                @pagador_endereco_nome_bairro,
                @pagador_endereco_nome_cidade,
                @pagador_endereco_sigla_UF,
                @pagador_endereco_numero_CEP,
                @sacador_avalista_pessoa_nome_pessoa,
                @sacador_avalista_pessoa_tipo_pessoa_codigo_tipo_pessoa,
                @sacador_avalista_pessoa_tipo_pessoa_numero_cadastro_pessoa_fisica,
                @sacador_avalista_endereco_nome_logradouro,
                @sacador_avalista_endereco_nome_bairro,
                @sacador_avalista_endereco_nome_cidade,
                @sacador_avalista_endereco_sigla_UF,
                @sacador_avalista_endereco_numero_CEP,
                @dados_individuais_boleto_numero_nosso_numero,
                @dados_individuais_boleto_data_vencimento,
                @dados_individuais_boleto_texto_uso_beneficiario,
                @dados_individuais_boleto_valor_titulo,
                @dados_individuais_boleto_data_limite_pagamento,
                @juros_data_juros,
                @juros_codigo_tipo_juros,
                @juros_valor_juros,
                @multa_codigo_tipo_multa,
                @multa_percentual_multa,
                @multa_data_multa,
                @descontos_codigo_tipo_desconto,
                @descontos_data_desconto,
                @descontos_valor_desconto,
                @descontos_percentual_desconto,
                @dados_qrcode_chave,
                @dados_qrcode_id_location,
                @TP_STATUS,
                @json_completo,
                GETDATE() -- data_hora_criacao
            );

            SET @ID_RET = 0;
            SET @DS_RET = 'Inserido com sucesso';
        END
        ELSE IF @Acao = 'U'
        BEGIN
            -- Atualização do status e da data de alteração
            UPDATE ETL_TEMP_CARGA_ATV_GERA_BOLETO_ITAU
            SET TP_STATUS = @TP_STATUS,
                data_hora_alteracao = GETDATE()
            WHERE id = @ID_PK;

            SET @ID_RET = 0;
            SET @DS_RET = 'Atualizado com sucesso';
        END
    END TRY
    BEGIN CATCH
        -- Tratamento de erros
        SET @ID_RET = 1;
        SET @DS_RET = ERROR_MESSAGE();
    END CATCH

    -- Retorno
    SELECT @ID_RET AS ID_RET, @DS_RET AS DS_RET;
END
