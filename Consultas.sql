-- Cosulta para mapa
SELECT REPLACE(en.uri_municipio,'-MARANHAO','') as municipio,COUNT(*) as qtd 
    FROM UFC.rfb_estabelecimento e 
    INNER JOIN UFC.rfb_endereco en ON e.URI_ENDERECO = en.uri AND en.URI_UNIDADE_FEDERATIVA = 'MARANHAO' 
GROUP BY en.uri_municipio;

-- Consulta para gráfico de estabelecimentos abertos (superior esquerdo 1)
SELECT DATA_INICIO_ATIV, COUNT(*) as qtd 
    FROM UFC.RFB_ESTABELECIMENTO e 
        INNER JOIN UFC.rfb_endereco en ON e.URI_ENDERECO = en.uri AND en.URI_UNIDADE_FEDERATIVA = 'MARANHAO' 
GROUP BY DATA_INICIO_ATIV 
ORDER BY DATA_INICIO_ATIV ASC


-- situação cadastral por data (superior esquerdo 2)
SELECT s.data_situacao_cadastral,s.URI_CLASSE_TIPO_SITUACAO, COUNT(*) as qtd 
    FROM UFC.RFB_ESTABELECIMENTO e 
        INNER JOIN UFC.rfb_endereco en ON e.URI_ENDERECO = en.uri AND en.URI_UNIDADE_FEDERATIVA = 'MARANHAO' 
        INNER JOIN UFC.rfb_situacao_cadastral s ON s.URI = e.URI_SITUACAO  
GROUP BY s.data_situacao_cadastral,s.URI_CLASSE_TIPO_SITUACAO 
ORDER BY s.data_situacao_cadastral ASC


-- qtd. por porte e situacao
SELECT e.uri_porte,s.uri_classe_tipo_situacao, COUNT(*) as qtd 
    FROM UFC.RFB_ESTABELECIMENTO e 
        INNER JOIN UFC.rfb_endereco en ON e.URI_ENDERECO = en.uri AND en.uri_unidade_federativa = 'MARANHAO' 
        INNER JOIN UFC.rfb_situacao_cadastral s ON s.URI = e.URI_SITUACAO 
GROUP BY e.uri_porte,s.uri_classe_tipo_situacao

-- qtd. de estabelecimentos por atividade
SELECT atividades.descricao, SUM(qtd) as qtd FROM (
    SELECT c.descricao,COUNT(*) as qtd 
        FROM UFC.rfb_estabelecimento e 
            INNER JOIN dom_cnaes c ON e.uri_principal_ativ_economica = c.cnae 
        GROUP BY c.descricao
    UNION
    SELECT c.descricao,COUNT(*) as qtd 
        FROM UFC.rfb_tem_ativ_econ_secundaria s 
            INNER JOIN dom_cnaes c ON s.uri_atividade_economica = c.cnae 
        GROUP BY c.descricao
) atividades GROUP BY atividades.descricao



-- Empresas
SELECT REPLACE(em.MUNICIPIO,' ','_') as municipio, j.NATUREZA_JURIDICA,COUNT(*) as QTD 
    FROM UFC.empresas em 
        INNER JOIN dom_natureza_juridica j ON j.codigo = em.COD_NAT_JURIDICA AND em.UF = 'MA' 
    GROUP BY em.MUNICIPIO, j.NATUREZA_JURIDICA