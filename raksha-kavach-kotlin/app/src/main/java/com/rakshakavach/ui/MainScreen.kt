package com.rakshakavach.ui

import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rakshakavach.ui.screens.*

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    
    NavHost(navController = navController, startDestination = "login") {
        composable("login") { 
            LoginScreen(
                onLoginSuccess = { navController.navigate("dashboard") }
            ) 
        }
        composable("dashboard") { 
            DashboardScreen(
                onNavigateToTasks = { navController.navigate("tasks") },
                onNavigateToScores = { navController.navigate("scores") }
            ) 
        }
        composable("tasks") { 
            TaskListScreen(
                onTaskSelected = { taskId -> navController.navigate("checklist/$taskId") }
            ) 
        }
        composable("checklist/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: ""
            GearChecklistScreen(
                taskId = taskId,
                onComplete = { navController.navigate("dashboard") }
            )
        }
        composable("scores") { 
            ScoresScreen(onBack = { navController.popBackStack() }) 
        }
    }
}
