<!-- Mobile Menu Overlay -->
<div id="mobileMenuOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden hidden" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<div id="sidebar" class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white shadow-xl transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
    <div class="p-4 lg:p-6 border-b border-purple-700">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span class="text-purple-800 font-bold text-xl">M</span>
                </div>
                <div>
                    <h1 class="text-lg lg:text-xl font-bold">HALCHASH</h1>
                    <p class="text-purple-300 text-xs hidden sm:block">Admin Panel</p>
                </div>
            </div>
            <button onclick="toggleSidebar()" class="lg:hidden text-purple-200 hover:text-white">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <p class="text-purple-200 text-sm mt-3"><?php echo htmlspecialchars($_SESSION['admin_username']); ?></p>
    </div>
    <nav class="mt-4 lg:mt-6 overflow-y-auto h-[calc(100vh-120px)]">
        <div class="px-4 mb-2">
            <p class="text-purple-400 text-xs font-semibold uppercase tracking-wider">Main Dashboards</p>
        </div>
        <a href="index.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'index.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-chart-line mr-3"></i> Business Dashboard
        </a>
        <a href="analytics.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'analytics.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-chart-bar mr-3"></i> Analytics Dashboard
        </a>
        
        <div class="px-4 mt-6 mb-2">
            <p class="text-purple-400 text-xs font-semibold uppercase tracking-wider">Management</p>
        </div>
        <a href="categories.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'categories.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-tags mr-3"></i> Categories
        </a>
        <a href="products.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'products.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-box mr-3"></i> Products
        </a>
        <a href="orders.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'orders.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-shopping-cart mr-3"></i> Orders
        </a>
        <a href="users.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'users.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-users mr-3"></i> Users
        </a>
        <a href="hero.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'hero.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-star mr-3"></i> Hero Products
        </a>
        
        <div class="px-4 mt-6 mb-2">
            <p class="text-purple-400 text-xs font-semibold uppercase tracking-wider">Settings</p>
        </div>
        <a href="data_management.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'data_management.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-database mr-3"></i> Data Management
        </a>
        <a href="change_password.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'change_password.php' ? 'bg-purple-700 text-white border-l-4 border-white' : 'hover:bg-purple-700/50 text-purple-200'; ?>">
            <i class="fas fa-key mr-3"></i> Change Password
        </a>
        <a href="logout.php" class="block px-6 py-3 hover:bg-purple-700/50 text-purple-200">
            <i class="fas fa-sign-out-alt mr-3"></i> Logout
        </a>
    </nav>
</div>

<script>
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileMenuOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Close sidebar when clicking outside on mobile
document.getElementById('mobileMenuOverlay')?.addEventListener('click', toggleSidebar);
</script>

