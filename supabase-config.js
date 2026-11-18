// =============================================================================
// مكتبة أنوار الواحة - إعدادات الاتصال بقاعدة بيانات Supabase
// =============================================================================
// تعليمات ربط لوحة التحكم وقاعدة البيانات:
// 1. افتح حسابك أو أنشئ مشروعاً مجانياً جديداً في موقع: https://supabase.com
// 2. ادخل إلى مشروعك ثم اضغط على أيقونة الإعدادات (Project Settings ⚙️) أسفل القائمة الجانبية.
// 3. اختر قسم (API) من القائمة.
// 4. انسخ (Project URL) والصقه مكان "YOUR_SUPABASE_URL" أدناه.
// 5. انسخ المفتاح العام (anon public key) والصقه مكان "YOUR_SUPABASE_ANON_KEY" أدناه.
// 6. احفظ هذا الملف، وسيتم ربط المتجر ولوحة التحكم (/admin) تلقائياً!
// =============================================================================

const SUPABASE_URL = "https://qcxzfoiprvgqtrvpihdr.supabase.co"; // رابط مشروع مكتبة أنوار الواحة
const SUPABASE_ANON_KEY = "sb_publishable_HYGyuqwci_tsU5s9HV8cPw_QwxhywTX"; // المفتاح العام المعتمد

/**
 * دالة مساعدة للتحقق من تهيئة المفاتيح بشكل صحيح
 */
function isSupabaseConfigured() {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.trim() !== '' &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_URL') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.trim() !== '' &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
  );
}

/**
 * تهيئة واسترجاع كائن Supabase Client الموحد
 */
let _supabaseClientInstance = null;

function getSupabase() {
  if (_supabaseClientInstance) {
    return _supabaseClientInstance;
  }

  if (isSupabaseConfigured() && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      _supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return _supabaseClientInstance;
    } catch (error) {
      console.warn("تعذر إنشاء اتصال Supabase:", error);
      return null;
    }
  }
  return null;
}

// إتاحة الكائن والإعدادات عالمياً لجميع ملفات المتجر ولوحة التحكم
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: isSupabaseConfigured,
  getClient: getSupabase
};
