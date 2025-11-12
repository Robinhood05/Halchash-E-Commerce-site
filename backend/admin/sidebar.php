<div class="w-64 bg-gray-800 text-white">
    <div class="p-6">
        <h1 class="text-2xl font-bold">Halchash Admin</h1>
        <p class="text-gray-400 text-sm mt-1">Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?></p>
    </div>
    <nav class="mt-6">
        <a href="index.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
            <i class="fas fa-dashboard mr-2"></i> Dashboard
        </a>
        <a href="categories.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'categories.php' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'; ?>">
            <i class="fas fa-tags mr-2"></i> Categories
        </a>
        <a href="products.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'products.php' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'; ?>">
            <i class="fas fa-box mr-2"></i> Products
        </a>
        <a href="orders.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'orders.php' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'; ?>">
            <i class="fas fa-shopping-cart mr-2"></i> Orders
        </a>
        <a href="hero.php" class="block px-6 py-3 <?php echo basename($_SERVER['PHP_SELF']) === 'hero.php' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-300'; ?>">
            <i class="fas fa-star mr-2"></i> Hero Products
        </a>
        <a href="logout.php" class="block px-6 py-3 hover:bg-gray-700 text-gray-300">
            <i class="fas fa-sign-out-alt mr-2"></i> Logout
        </a>
    </nav>
</div>

