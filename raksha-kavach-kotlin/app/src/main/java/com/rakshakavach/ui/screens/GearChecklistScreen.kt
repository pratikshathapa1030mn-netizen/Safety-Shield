package com.rakshakavach.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class GearItem(val id: String, val label: String)

@Composable
fun GearChecklistScreen(taskId: String, onComplete: () -> Unit) {
    val gearItems = remember {
        listOf(
            GearItem("helmet", "Safety Helmet"),
            GearItem("vest", "High-Vis Vest"),
            GearItem("boots", "Steel-Toe Boots"),
            GearItem("gloves", "Safety Gloves"),
            GearItem("glasses", "Eye Protection")
        )
    }
    
    val checkedItems = remember { mutableStateMapOf<String, Boolean>() }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Gear Check: $taskId") })
        },
        bottomBar = {
            Button(
                onClick = onComplete,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                enabled = checkedItems.size == gearItems.size && checkedItems.values.all { it }
            ) {
                Text("Confirm & Start Task")
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
            items(gearItems) { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = checkedItems[item.id] ?: false,
                        onCheckedChange = { checkedItems[item.id] = it }
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(item.label, style = MaterialTheme.typography.bodyLarge)
                }
                Divider()
            }
        }
    }
}
