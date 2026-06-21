export function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <button type="submit" className="maurie-button-secondary min-w-0 px-4 py-3">
        Logout
      </button>
    </form>
  );
}
