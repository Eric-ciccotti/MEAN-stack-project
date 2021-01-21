import { Component, OnDestroy, OnInit,  } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: 'First post', content: 'blabla' },
  //   { title: 'Second post', content: 'blabla' },
  //   { title: 'Third post', content: 'blabla' },
  // ];

  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 3, 10];
  currentPage = 1;

  spinnerLoading = false;
  posts: Post[] = [];
  private postsSub: Subscription;

  constructor(public postsService: PostsService) {
  }

  onChangePage(pageData: PageEvent) {
    //il se remet sur off automatiquement dans le
    this.spinnerLoading = true;
    //on démarre l'index des pages à partir de zero
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  nextStep(){}

  onDelete(postId: string){
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage)
    });
  }

  ngOnInit(): void {
    this.spinnerLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
    .subscribe((postsData: {posts: Post[], postCount: number}) => {
      this.spinnerLoading = false;
      this.totalPosts = postsData.postCount;
      this.posts = postsData.posts;
    })
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
