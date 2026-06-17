#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest.h"
#include "pbl.cpp"


#include <sstream>
#include <iostream>


TEST_CASE("Playlist initially empty")
{
    Playlist p;
    CHECK(p.songExists("Believer") == false);
}

TEST_CASE("Add song and verify existence")
{
    Playlist p;

    std::istringstream input(
        "Believer\n"
        "Imagine Dragons\n"
    );

    std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());

    p.addSong();

    std::cin.rdbuf(oldCin);

    CHECK(p.songExists("Believer") == true);
}

TEST_CASE("Add multiple songs")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    {
        std::istringstream input(
            "Thunder\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Believer"));
    CHECK(p.songExists("Thunder"));
}

TEST_CASE("Duplicate song should not create second entry")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Believer"));
}

TEST_CASE("Delete existing song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Believer"));

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.deleteSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Believer") == false);
}

TEST_CASE("Search existing song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Believer") == true);
}

TEST_CASE("Rename song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
            "Thunder\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.renameSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK(p.songExists("Thunder") == true);
}

TEST_CASE("Play top song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK_NOTHROW(p.playTopSong());
}

TEST_CASE("Play next song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    {
        std::istringstream input(
            "Thunder\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    p.playTopSong();

    CHECK_NOTHROW(p.playNextSong());
}

TEST_CASE("Play previous song")
{
    Playlist p;

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    p.playTopSong();

    CHECK_NOTHROW(p.playPreviousSong());
}

TEST_CASE("Sort playlist")
{
    Playlist p;

    {
        std::istringstream input(
            "Thunder\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    {
        std::istringstream input(
            "Believer\n"
            "Imagine Dragons\n"
        );

        std::streambuf* oldCin = std::cin.rdbuf(input.rdbuf());
        p.addSong();
        std::cin.rdbuf(oldCin);
    }

    CHECK_NOTHROW(p.sortPlaylist());
}