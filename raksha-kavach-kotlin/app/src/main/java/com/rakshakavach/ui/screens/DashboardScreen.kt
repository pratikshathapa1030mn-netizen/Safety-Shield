package com.rakshakavach.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

data class DashboardItem(val id: String, val label: String, val icon: ImageVector)

@Composable
fun DashboardScreen(
    onNavigateToTasks: () -> Unit,
    onNavigateToScores: () -> Unit
) {
    val items = listOf(
        DashboardItem("tasks", "Select Task", Icons.Default.List),
        DashboardItem("quiz", "Safety Quiz", Icons.Default.QuestionAnswer),
        DashboardItem("incident", "Log Incident", Icons.Default.Warning),
        DashboardItem("history", "View History", Icons.Default.History)
    )

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Dashboard") })
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text(
                "Welcome back, Safety Auditor",
                style = MaterialTheme.typography.headlineSmall
            )
            Spacer(modifier = Modifier.height(24.dp))
            
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(items) { item ->
                    Card(
                        onClick = {
                            if (item.id == "tasks") onNavigateToTasks()
                            if (item.id == "history") onNavigateToScores()
                        },
                        modifier = Modifier.height(140.dp)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxSize().padding(16.dp),
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(item.icon, contentDescription = null, modifier = Modifier.size(32.dp))
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(item.label, style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
            }
        }
    }
}
