<?php
session_start();
require_once '../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDBConnection();

// Get last 6 months profit data
$profitData = [];
$productsSoldData = [];

for ($i = 5; $i >= 0; $i--) {
    $monthStart = date('Y-m-01', strtotime("-$i months"));
    $monthEnd = date('Y-m-t', strtotime("-$i months"));
    $monthName = date('M Y', strtotime("-$i months"));
    
    // Calculate profit for this month (only delivered orders)
    // Profit = (selling_price - buying_price) * quantity
    $stmt = $pdo->prepare("
        SELECT 
            COALESCE(SUM(
                CASE 
                    WHEN oi.buying_price IS NULL OR oi.buying_price = 0 THEN 0
                    ELSE (oi.product_price - oi.buying_price) * oi.quantity
                END
            ), 0) as profit
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = 'delivered' 
        AND DATE(o.created_at) >= ? 
        AND DATE(o.created_at) <= ?
    ");
    $stmt->execute([$monthStart, $monthEnd]);
    $profit = $stmt->fetchColumn();
    $profit = max(0, (float)$profit); // Ensure non-negative
    
    // Count products sold for this month (only delivered orders)
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(oi.quantity), 0) as products_sold
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status = 'delivered' 
        AND DATE(o.created_at) >= ? 
        AND DATE(o.created_at) <= ?
    ");
    $stmt->execute([$monthStart, $monthEnd]);
    $productsSold = $stmt->fetchColumn();
    
    $profitData[] = [
        'month' => $monthName,
        'profit' => (float)$profit
    ];
    
    $productsSoldData[] = [
        'month' => $monthName,
        'sold' => (int)$productsSold
    ];
}

// Get total statistics
$totalProfit = $pdo->query("
    SELECT COALESCE(SUM(
        CASE 
            WHEN oi.buying_price IS NULL OR oi.buying_price = 0 THEN 0
            ELSE (oi.product_price - oi.buying_price) * oi.quantity
        END
    ), 0) as total_profit
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status = 'delivered'
")->fetchColumn();
$totalProfit = max(0, (float)$totalProfit); // Ensure non-negative

$totalProductsSold = $pdo->query("
    SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status = 'delivered'
")->fetchColumn();

$totalSales = $pdo->query("
    SELECT COALESCE(SUM(total_amount), 0) as total_sales
    FROM orders
    WHERE status = 'delivered'
")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <?php include 'sidebar.php'; ?>
        
        <div class="flex-1 overflow-auto lg:ml-0">
            <!-- Mobile Top Bar -->
            <div class="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                <button onclick="toggleSidebar()" class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <h2 class="text-lg font-bold mt-2">Analytics Dashboard</h2>
            </div>
            
            <div class="p-4 lg:p-8">
                <h2 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-6 hidden lg:block">Analytics Dashboard</h2>

                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Profit</p>
                                <p class="text-3xl font-bold text-green-600">৳<?php echo number_format($totalProfit, 2); ?></p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-full">
                                <i class="fas fa-chart-line text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Products Sold</p>
                                <p class="text-3xl font-bold text-blue-600"><?php echo number_format($totalProductsSold); ?></p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-full">
                                <i class="fas fa-box text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-600 text-sm">Total Sales</p>
                                <p class="text-3xl font-bold text-purple-600">৳<?php echo number_format($totalSales, 2); ?></p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-full">
                                <i class="fas fa-money-bill-wave text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Profit Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-xl font-bold mb-4">Profit Earned (Last 6 Months)</h3>
                        <div style="position: relative; height: 300px;">
                            <canvas id="profitChart"></canvas>
                        </div>
                    </div>

                    <!-- Products Sold Chart -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-xl font-bold mb-4">Products Sold (Last 6 Months)</h3>
                        <div style="position: relative; height: 300px;">
                            <canvas id="productsSoldChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Profit Chart
        const profitCtx = document.getElementById('profitChart');
        const profitDataRaw = <?php echo json_encode($profitData); ?>;
        
        // Validate and format profit data
        const profitData = profitDataRaw.map(d => {
            const profit = parseFloat(d.profit) || 0;
            return Math.max(0, profit); // Ensure non-negative
        });
        
        // Calculate max value for better scaling (add 10% padding)
        const maxProfit = Math.max(...profitData, 1000);
        const suggestedMax = maxProfit > 0 ? Math.ceil(maxProfit * 1.1) : 1000;
        
        new Chart(profitCtx, {
            type: 'line',
            data: {
                labels: profitDataRaw.map(d => d.month),
                datasets: [{
                    label: 'Profit (৳)',
                    data: profitData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Profit: ৳' + parseFloat(context.parsed.y).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: suggestedMax,
                        ticks: {
                            callback: function(value) {
                                return '৳' + parseFloat(value).toLocaleString('en-US', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Products Sold Chart
        const productsSoldCtx = document.getElementById('productsSoldChart');
        const productsSoldDataRaw = <?php echo json_encode($productsSoldData); ?>;
        
        // Validate and format products sold data
        const productsSoldData = productsSoldDataRaw.map(d => {
            const sold = parseInt(d.sold) || 0;
            return Math.max(0, sold); // Ensure non-negative
        });
        
        new Chart(productsSoldCtx, {
            type: 'bar',
            data: {
                labels: productsSoldDataRaw.map(d => d.month),
                datasets: [{
                    label: 'Products Sold',
                    data: productsSoldData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Products Sold: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: Math.max(1, Math.ceil(Math.max(...productsSoldData, 10) / 10)),
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>

