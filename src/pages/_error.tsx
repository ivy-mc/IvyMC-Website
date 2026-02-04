import { NextPage } from "next";

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', textAlign: 'center' }}>
      <h1>{statusCode || 'Bir Hata Oluştu'}</h1>
      <p>
        {statusCode
          ? `Sunucu tarafında ${statusCode} hatası oluştu.`
          : "İstemci tarafında bir hata oluştu."}
      </p>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
