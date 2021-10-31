const Login = () => {
  const onLoginClicked = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <>
      <button onClick={onLoginClicked}>Login</button>
    </>
  );
};

export default Login;
