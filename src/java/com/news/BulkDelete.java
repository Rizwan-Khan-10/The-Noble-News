/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/BulkDelete")
public class BulkDelete extends HttpServlet {

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        BufferedReader reader = request.getReader();
        Gson gson = new Gson();
        NewsData[] newsDataArray = gson.fromJson(reader, NewsData[].class);

        if (newsDataArray == null || newsDataArray.length == 0) {
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\": false, \"message\": \"No data provided\"}");
            return;
        }

        Connection con = null;
        PreparedStatement ps = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");

            String query = "DELETE FROM saved_news WHERE email = ? AND url = ?";
            ps = con.prepareStatement(query);

            int deletedCount = 0;

            for (NewsData newsData : newsDataArray) {
                if (newsData.getUrl() != null && newsData.getEmail() != null) {
                    ps.setString(1, newsData.getEmail());
                    ps.setString(2, newsData.getUrl());
                    deletedCount += ps.executeUpdate();
                }
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            if (deletedCount > 0) {
                response.getWriter().write("{\"success\": true, \"message\": \"News deleted successfully\"}");
            } else {
                response.getWriter().write("{\"success\": false, \"message\": \"Failed to delete news\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\": false, \"message\": \"Internal server error\"}");
        } finally {
            try {
                if (ps != null) {
                    ps.close();
                }
                if (con != null) {
                    con.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public class NewsData {
        private String url;
        private String email;

        public NewsData() {
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
