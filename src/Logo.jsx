export default function Logo({ size = 80 }) {
  return <svg viewBox="0 0 250 222" width={size} height={size * 222 / 250} role="img" aria-label="VITAKU"><defs>
    <linearGradient id="lga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8B5CF6" /><stop offset="1" stopColor="#C026D3" /></linearGradient>
    <linearGradient id="lgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F43F8E" /><stop offset="1" stopColor="#E11D48" /></linearGradient></defs>
    <path d="M0 0H69L120 144V222Z" fill="url(#lga)" /><path d="M181 0H250L139 222V120Z" fill="url(#lgb)" /><circle cx="124" cy="38" r="23" fill="#E11D48" /></svg>
}
