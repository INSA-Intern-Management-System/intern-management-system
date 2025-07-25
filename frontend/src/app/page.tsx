export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Welcome to Intern Management System</h1>
      <a
        href="/login"
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "#fff",
          borderRadius: "5px",
          textDecoration: "none",
          marginTop: "20px",
        }}
      >
        Login
      </a>
    </div>
  );
}
