import { NextPageContext } from "next";

interface ErrorPageProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorPageProps) {
  return (
    <html>
      <head>
        <title>Hata</title>
      </head>
      <body style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        flexDirection: 'column', 
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h1>{statusCode || 'Bir Hata Oluştu'}</h1>
        <p>
          {statusCode === 404
            ? "Sayfa bulunamadı"
            : statusCode
            ? `Sunucu tarafında ${statusCode} hatası oluştu.`
            : "İstemci tarafında bir hata oluştu."}
        </p>
      </body>
    </html>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};

export default Error;
