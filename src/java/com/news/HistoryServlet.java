/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import java.io.BufferedReader;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/HistoryServlet")
public class HistoryServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            Gson gson = new Gson();
            InputStreamReader reader = new InputStreamReader(request.getInputStream());
            JsonObject json = gson.fromJson(reader, JsonObject.class);

            String email = json.get("email").getAsString();
            String title = json.get("title").getAsString();
            String url = json.get("url").getAsString();
            String imageUrl = json.get("imageUrl").getAsString();
            String source = json.get("source").getAsString();
            String description = json.get("description").getAsString();

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String date = sdf.format(new java.util.Date());

            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "rizw@nKing777");

            String query = "INSERT INTO user_history (email, news_title, news_url, image_url, news_source, news_desc, news_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, email);
            ps.setString(2, title);
            ps.setString(3, url);
            ps.setString(4, imageUrl);
            ps.setString(5, source);
            ps.setString(6, description);
            ps.setString(7, date);

            int result = ps.executeUpdate();

            JsonObject jsonResponse = new JsonObject();
            if (result > 0) {
                jsonResponse.addProperty("status", "success");
            } else {
                jsonResponse.addProperty("status", "failure");
            }

            response.getWriter().write(gson.toJson(jsonResponse));
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("status", "error");
            response.getWriter().write(new Gson().toJson(jsonResponse));
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String email = request.getParameter("email");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "rizw@nKing777");

            String query = "SELECT news_title, news_url, image_url, news_source, news_desc, news_date FROM user_history WHERE email = ?";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            ArrayList<JsonObject> historyList = new ArrayList<>();
            while (rs.next()) {
                JsonObject historyItem = new JsonObject();
                historyItem.addProperty("title", rs.getString("news_title"));
                historyItem.addProperty("url", rs.getString("news_url"));
                historyItem.addProperty("imageUrl", rs.getString("image_url"));
                historyItem.addProperty("source", rs.getString("news_source"));
                historyItem.addProperty("description", rs.getString("news_desc"));
                historyItem.addProperty("date", rs.getString("news_date"));
                historyList.add(historyItem);
            }

            Gson gson = new Gson();
            response.getWriter().write(gson.toJson(historyList));
            rs.close();
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("status", "error");
            response.getWriter().write(new Gson().toJson(jsonResponse));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            Gson gson = new Gson();
            BufferedReader reader = request.getReader();
            JsonObject json = gson.fromJson(reader, JsonObject.class);

            String email = json.get("email").getAsString();
            String url = json.has("url") ? json.get("url").getAsString() : null;
            String date = json.has("date") ? json.get("date").getAsString() : null;

            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "rizw@nKing777");

            String query;
            PreparedStatement ps;

            if (url != null) {
                // Delete a specific article based on the URL
                query = "DELETE FROM user_history WHERE email = ? AND news_url = ?";
                ps = con.prepareStatement(query);
                ps.setString(1, email);
                ps.setString(2, url);
            } else if (date != null) {
                // Delete all news for a specific date (ensure the date is in YYYY-MM-DD format)
                query = "DELETE FROM user_history WHERE email = ? AND DATE(news_date) = ?";
                ps = con.prepareStatement(query);
                ps.setString(1, email);
                ps.setString(2, date);
            } else {
                // Delete all news for the user
                query = "DELETE FROM user_history WHERE email = ?";
                ps = con.prepareStatement(query);
                ps.setString(1, email);
            }

            int result = ps.executeUpdate();
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("status", result > 0 ? "success" : "failure");

            response.getWriter().write(gson.toJson(jsonResponse));
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("status", "error");
            response.getWriter().write(new Gson().toJson(jsonResponse));
        }
    }
}
