import { NextPageContext } from "next";

interface ErrorPageProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorPageProps) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      flexDirection: 'column', 
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>{statusCode || 'Bir Hata Oluştu'}</h1>
      <p>
        {statusCode
          ? `Sunucu tarafında ${statusCode} hatası oluştu.`
          : "İstemci tarafında bir hata oluştu."}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};

export default Error;
