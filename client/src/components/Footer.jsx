
function Footer() {
  return (
    <footer className="bg-dark text-secondary text-center py-4 mt-5">
      <p className="mb-1">
        © {new Date().getFullYear()} IMovies
      </p>
      <small>Discover movies. Book your seats.</small>
    </footer>
  );
}

export default Footer;
