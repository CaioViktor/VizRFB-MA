-- Cosulta para mapa
SELECT en.cidade,COUNT(*) FROM rfb_estabelecimento e INNER JOIN rfb_endereco en ON e.URI_ENDERECO_NACIONAL = en.uri AND en.estado = 'MARANHAO' GROUP BY en.cidade;

-- Consulta para gráfico de estabelecimentos abertos
SELECT DATA_INICIO_ATIV, COUNT(*) FROM RFB_ESTABELECIMENTO e INNER JOIN rfb_endereco en ON e.URI_ENDERECO_NACIONAL = en.uri AND en.estado = 'MARANHAO' GROUP BY DATA_INICIO_ATIV ORDER BY DATA_INICIO_ATIV ASC


-- situação cadastral por data
SELECT s.data_situacao_cadastral,s.tipo_situacao, COUNT(*) FROM RFB_ESTABELECIMENTO e INNER JOIN rfb_endereco en ON e.URI_ENDERECO_NACIONAL = en.uri AND en.estado = 'MARANHAO' INNER JOIN rfb_situacao_cadastral s ON s.URI = e.URI_SITUACAO  GROUP BY s.data_situacao_cadastral,s.tipo_situacao ORDER BY s.data_situacao_cadastral ASC