package com.rakshakavach.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Task(val id: String, val title: String, val risk: String)

@Composable
fun TaskListScreen(onTaskSelected: (String) -> Unit) {
    val tasks = listOf(
        Task("welding", "Welding Maintenance", "High"),
        Task("trenching", "Excavation & Trenching", "High"),
        Task("forklift", "Forklift Operations", "Moderate"),
        Task("scaffold", "Scaffold Erection", "Moderate")
    )

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Select Task") })
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(tasks) { task ->
                ListItem(
                    headlineContent = { Text(task.title) },
                    supportingContent = { Text("Risk: ${task.risk}") },
                    trailingContent = { 
                        IconButton(onClick = { onTaskSelected(task.id) }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = null)
                        }
                    },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
                Divider()
            }
        }
    }
}
