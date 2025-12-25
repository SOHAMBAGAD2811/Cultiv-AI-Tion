export async function getSessionSafe(supabase: any) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error('[auth] getSession failed:', err);
    try {
      // Attempt to clear broken auth state
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    return null;
  }
}
