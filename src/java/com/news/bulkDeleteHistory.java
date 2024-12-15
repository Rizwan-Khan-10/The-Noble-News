/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/bulkDeleteHistory")
public class bulkDeleteHistory extends HttpServlet {

    private Gson gson = new Gson();

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        StringBuilder stringBuilder = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
            }
        }

        String requestData = stringBuilder.toString();
        JsonObject jsonRequest = gson.fromJson(requestData, JsonObject.class);

        String email = jsonRequest.get("email").getAsString();
        JsonArray jsonUrls = jsonRequest.getAsJsonArray("urls");
        List<String> newsUrls = new ArrayList<>();

        for (int i = 0; i < jsonUrls.size(); i++) {
            newsUrls.add(jsonUrls.get(i).getAsString());
        }

        JsonObject jsonResponse = new JsonObject();

        if (email == null || newsUrls == null || newsUrls.isEmpty()) {
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "Invalid input data");
            sendResponse(response, jsonResponse);
            return;
        }

        try {
            deleteSelectedNews(email, newsUrls);
            jsonResponse.addProperty("status", "success");
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "Failed to delete selected news: " + e.getMessage());
        }

        sendResponse(response, jsonResponse);
    }

    private void deleteSelectedNews(String email, List<String> newsUrls) throws SQLException, ClassNotFoundException {
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");
            String sql = "DELETE FROM user_history WHERE email = ? AND news_url = ?"; // Updated column name
            stmt = conn.prepareStatement(sql);

            for (String url : newsUrls) {
                stmt.setString(1, email);
                stmt.setString(2, url);
                stmt.addBatch();
            }

            stmt.executeBatch();

        } finally {
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        }
    }

    private void sendResponse(HttpServletResponse response, JsonObject jsonResponse) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(jsonResponse));
    }
}
