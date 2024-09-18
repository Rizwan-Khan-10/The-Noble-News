/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/CommentsServlet")
public class CommentsServlet extends HttpServlet {

    private Connection connect() {
        String jdbcURL = "jdbc:mysql://localhost:3306/user_login_db";
        String dbUser = "root";
        String dbPassword = "rizw@nKing777";
        Connection conn = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String url = request.getParameter("url");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (url != null && !url.isEmpty()) {
            try (Connection conn = connect()) {
                String sql = "SELECT username, comment, comment_date FROM comments WHERE url = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, url);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, String>> comments = new ArrayList<>();
                while (rs.next()) {
                    Map<String, String> commentData = new HashMap<>();
                    commentData.put("username", rs.getString("username"));
                    commentData.put("comment", rs.getString("comment"));
                    commentData.put("date", rs.getString("comment_date"));
                    comments.add(commentData);
                }

                if (comments.isEmpty()) {
                    JsonObject json = new JsonObject();
                    json.addProperty("status", "no_comments");
                    json.addProperty("message", "No comments available for this URL.");
                    out.println(json.toString());
                } else {
                    Gson gson = new Gson();
                    JsonObject json = new JsonObject();
                    json.addProperty("status", "success");
                    json.add("comments", gson.toJsonTree(comments));
                    out.println(json.toString());
                }

            } catch (SQLException e) {
                e.printStackTrace();
                JsonObject json = new JsonObject();
                json.addProperty("status", "error");
                json.addProperty("message", "Internal server error: " + e.getMessage());
                out.println(json.toString());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"status\": \"error\", \"message\": \"URL parameter is missing.\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Gson gson = new Gson();
        JsonObject requestData = gson.fromJson(request.getReader(), JsonObject.class);

        String email = requestData.get("email").getAsString();
        String url = requestData.get("url").getAsString();
        String comment = requestData.get("comment").getAsString();

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (email != null && url != null && comment != null) {
            try (Connection conn = connect()) {
                String fetchUsernameSql = "SELECT username FROM users WHERE email = ?";
                PreparedStatement fetchStmt = conn.prepareStatement(fetchUsernameSql);
                fetchStmt.setString(1, email);
                ResultSet rs = fetchStmt.executeQuery();

                if (rs.next()) {
                    String username = rs.getString("username");

                    String insertCommentSql = "INSERT INTO comments (username, url, comment, comment_date) VALUES (?, ?, ?, ?)";
                    PreparedStatement insertStmt = conn.prepareStatement(insertCommentSql);

                    insertStmt.setString(1, username);
                    insertStmt.setString(2, url);
                    insertStmt.setString(3, comment);

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    String currentDate = sdf.format(new java.util.Date());
                    insertStmt.setString(4, currentDate);

                    int rowsInserted = insertStmt.executeUpdate();
                    if (rowsInserted > 0) {
                        JsonObject json = new JsonObject();
                        json.addProperty("status", "success");
                        json.addProperty("message", "Comment added successfully.");
                        out.println(json.toString());
                    } else {
                        JsonObject json = new JsonObject();
                        json.addProperty("status", "error");
                        json.addProperty("message", "Failed to add comment.");
                        out.println(json.toString());
                    }
                } else {
                    JsonObject json = new JsonObject();
                    json.addProperty("status", "error");
                    json.addProperty("message", "User not found for the given email.");
                    out.println(json.toString());
                }
            } catch (SQLException e) {
                e.printStackTrace();
                JsonObject json = new JsonObject();
                json.addProperty("status", "error");
                json.addProperty("message", "Server error: " + e.getMessage());
                out.println(json.toString());
            }
        } else {
            JsonObject json = new JsonObject();
            json.addProperty("status", "error");
            json.addProperty("message", "Invalid request parameters.");
            out.println(json.toString());
        }
    }
}
